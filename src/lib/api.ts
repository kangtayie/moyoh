import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { phoneToEmail } from './phone';

export type Role = 'foreigner' | 'local';
export type Gender = 'female' | 'male';

export const GENDER_LABEL: Record<Gender, string> = { female: '여성', male: '남성' };

export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'done';

export interface Profile {
  id: string;
  role: Role;
  name: string;
  nationality: string | null;
  topik_level: number | null;
  gender: Gender | null;
  birth_year: number | null;
  neighborhood: string | null;
  available: string | null;
  bio: string;
}

/** 사전 등록 스크립트가 계정에 적어 두는 설문 값. 첫 로그인 프로필을 만들 때 쓴다 */
export interface UserMeta {
  preregistered?: boolean;
  role?: Role;
  topik_level?: number | null;
  region?: string | null;
  activities?: string[];
}

export interface Interest {
  user_id: string;
  activity_id: string;
}

export interface Booking {
  id: string;
  activity_id: string;
  foreigner_id: string;
  local_id: string;
  requested_by: string;
  date: string;
  time: string;
  message: string;
  status: BookingStatus;
  cards: string[];
  created_at: string;
  updated_at: string;
}

export type NewBooking = Pick<Booking, 'activity_id' | 'foreigner_id' | 'local_id' | 'date' | 'time' | 'message'>;

export interface Api {
  /** 키가 없어 이 브라우저 안에서만 동작하는 체험 모드 */
  localMode: boolean;
  currentUserId(): Promise<string | null>;
  userMeta(): Promise<UserMeta>;
  onAuthChange(cb: (userId: string | null) => void): () => void;
  signUp(email: string, password: string): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  profiles(): Promise<Profile[]>;
  saveProfile(p: Profile): Promise<void>;
  interests(): Promise<Interest[]>;
  setInterest(userId: string, activityId: string, on: boolean): Promise<void>;
  bookings(userId: string): Promise<Booking[]>;
  createBooking(userId: string, b: NewBooking): Promise<void>;
  updateBooking(id: string, patch: Partial<Pick<Booking, 'status' | 'cards'>>): Promise<void>;
}

// ---------- Supabase ----------

function supabaseApi(sb: SupabaseClient): Api {
  const check = <T,>(r: { data: T; error: { message: string } | null }) => {
    if (r.error) throw new Error(r.error.message);
    return r.data;
  };
  return {
    localMode: false,
    async currentUserId() {
      const { data } = await sb.auth.getSession();
      return data.session?.user.id ?? null;
    },
    async userMeta() {
      const { data } = await sb.auth.getSession();
      return (data.session?.user.user_metadata ?? {}) as UserMeta;
    },
    onAuthChange(cb) {
      const { data } = sb.auth.onAuthStateChange((_e, s) => cb(s?.user.id ?? null));
      return () => data.subscription.unsubscribe();
    },
    async signUp(email, password) {
      const r = await sb.auth.signUp({ email, password });
      if (r.error) throw new Error(r.error.message);
      if (!r.data.session) throw new Error('가입 확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인해 주세요.');
    },
    async signIn(email, password) {
      const r = await sb.auth.signInWithPassword({ email, password });
      if (r.error) throw new Error(r.error.message);
    },
    async signOut() {
      await sb.auth.signOut();
    },
    async profiles() {
      return check(await sb.from('profiles').select('*')) as Profile[];
    },
    async saveProfile(p) {
      check(await sb.from('profiles').upsert(p));
    },
    async interests() {
      return check(await sb.from('interests').select('user_id, activity_id')) as Interest[];
    },
    async setInterest(userId, activityId, on) {
      if (on) check(await sb.from('interests').upsert({ user_id: userId, activity_id: activityId }));
      else check(await sb.from('interests').delete().match({ user_id: userId, activity_id: activityId }));
    },
    async bookings() {
      // 읽기 규칙(RLS)이 당사자 약속만 돌려준다
      return check(await sb.from('bookings').select('*').order('date')) as Booking[];
    },
    async createBooking(userId, b) {
      check(await sb.from('bookings').insert({ ...b, requested_by: userId }));
    },
    async updateBooking(id, patch) {
      check(await sb.from('bookings').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id));
    },
  };
}

// ---------- 체험 모드 (localStorage) ----------

interface LocalDb {
  users: { id: string; email: string; password: string; meta?: UserMeta }[];
  profiles: Profile[];
  interests: Interest[];
  bookings: Booking[];
}

const DB_KEY = 'moyoh.db.v4';
const SESSION_KEY = 'moyoh.session';

/** 체험 모드에서 처음부터 매칭 상대가 보이도록 넣어 두는 샘플 사람들 */
export const SAMPLE_PASSWORD = 'sample-only';
export const PREREGISTERED_SAMPLES: { phone: string; label: string; meta: UserMeta }[] = [
  { phone: '01000000001', label: '사전 등록 유학생', meta: { preregistered: true, role: 'foreigner', topik_level: 3 } },
  { phone: '01000000002', label: '사전 등록 주민', meta: { preregistered: true, role: 'local', region: '서울', activities: ['gwangjang', 'seochon'] } },
];
function seed(): LocalDb {
  const p = (x: Partial<Profile> & Pick<Profile, 'id' | 'role' | 'name' | 'bio'>): Profile => ({
    nationality: null, topik_level: null, gender: null, birth_year: null, neighborhood: null, available: null, ...x,
  });
  const profiles = [
    p({ id: 's-local-1', role: 'local', name: '김영숙', gender: 'female', neighborhood: '서울 종로구 창신동', available: '평일 오전, 토요일', bio: '광장시장 근처에서 30년째 살고 있어요. 단골 빈대떡집이랑 성곽길 알려 드릴게요.' }),
    p({ id: 's-local-2', role: 'local', name: '이준호', gender: 'male', neighborhood: '서울 마포구 망원동', available: '주말 오후', bio: '망원동에서 작은 책방을 해요. 골목 이야기랑 한강 피크닉 좋아해요.' }),
    p({ id: 's-local-3', role: 'local', name: '박민지', gender: 'female', neighborhood: '경기 수원시 팔달구', available: '평일 저녁, 일요일', bio: '박물관 해설 봉사를 해요. 화성이랑 조선 이야기는 밤새 할 수 있어요!' }),
    p({ id: 's-for-1', role: 'foreigner', name: 'Linh', gender: 'female', nationality: '베트남', topik_level: 3, bio: '서울에서 교환학생 중이에요. 시장 음식이랑 사진 찍는 걸 좋아해요.' }),
    p({ id: 's-for-2', role: 'foreigner', name: 'Aziz', gender: 'male', nationality: '우즈베키스탄', topik_level: 2, bio: '한국어를 1년 배웠어요. 역사에 관심이 많아요.' }),
  ];
  const interests: Interest[] = [
    ['s-local-1', 'gwangjang'], ['s-local-1', 'naksan'], ['s-local-1', 'bukchon-craft'],
    ['s-local-2', 'mangwon'], ['s-local-2', 'seochon'], ['s-local-2', 'paju-books'],
    ['s-local-3', 'suwon'], ['s-local-3', 'museum'], ['s-local-3', 'namhansan'],
    ['s-for-1', 'gwangjang'], ['s-for-1', 'seochon'], ['s-for-1', 'mangwon'],
    ['s-for-2', 'naksan'], ['s-for-2', 'suwon'], ['s-for-2', 'bukchon-craft'],
  ].map(([user_id, activity_id]) => ({ user_id, activity_id }));
  const users: LocalDb['users'] = profiles.map((x) => ({ id: x.id, email: `${x.id}@sample.moyoh`, password: SAMPLE_PASSWORD }));
  // 사전 등록 흐름을 시험하는 가짜 번호. 아이디와 비밀번호가 같다
  for (const p of PREREGISTERED_SAMPLES) users.push({ id: `p-${p.phone}`, email: phoneToEmail(p.phone), password: p.phone, meta: p.meta });
  return { users, profiles, interests, bookings: [] };
}

function localApi(): Api {
  const load = (): LocalDb => {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* 깨졌으면 새로 시작 */ }
    const db = seed();
    save(db);
    return db;
  };
  const save = (db: LocalDb) => localStorage.setItem(DB_KEY, JSON.stringify(db));
  const listeners = new Set<(id: string | null) => void>();
  const setSession = (id: string | null) => {
    if (id) localStorage.setItem(SESSION_KEY, id);
    else localStorage.removeItem(SESSION_KEY);
    listeners.forEach((l) => l(id));
  };
  const now = () => new Date().toISOString();

  return {
    localMode: true,
    async currentUserId() {
      return localStorage.getItem(SESSION_KEY);
    },
    async userMeta() {
      const id = localStorage.getItem(SESSION_KEY);
      return load().users.find((u) => u.id === id)?.meta ?? {};
    },
    onAuthChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    async signUp(email, password) {
      const db = load();
      const e = email.trim().toLowerCase();
      if (db.users.some((u) => u.email === e)) throw new Error('이미 가입한 이메일이에요.');
      if (password.length < 6) throw new Error('비밀번호는 6자 이상이어야 해요.');
      const id = crypto.randomUUID();
      db.users.push({ id, email: e, password });
      save(db);
      setSession(id);
    },
    async signIn(email, password) {
      const u = load().users.find((x) => x.email === email.trim().toLowerCase() && x.password === password);
      if (!u) throw new Error('이메일 또는 비밀번호가 맞지 않아요.');
      setSession(u.id);
    },
    async signOut() {
      setSession(null);
    },
    async profiles() {
      return load().profiles;
    },
    async saveProfile(p) {
      const db = load();
      db.profiles = [...db.profiles.filter((x) => x.id !== p.id), p];
      save(db);
    },
    async interests() {
      return load().interests;
    },
    async setInterest(userId, activityId, on) {
      const db = load();
      db.interests = db.interests.filter((i) => !(i.user_id === userId && i.activity_id === activityId));
      if (on) db.interests.push({ user_id: userId, activity_id: activityId });
      save(db);
    },
    async bookings(userId) {
      return load()
        .bookings.filter((b) => b.foreigner_id === userId || b.local_id === userId)
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    async createBooking(userId, b) {
      const db = load();
      db.bookings.push({ ...b, id: crypto.randomUUID(), requested_by: userId, status: 'pending', cards: [], created_at: now(), updated_at: now() });
      save(db);
    },
    async updateBooking(id, patch) {
      const db = load();
      db.bookings = db.bookings.map((b) => (b.id === id ? { ...b, ...patch, updated_at: now() } : b));
      save(db);
    },
  };
}

const url = import.meta.env.VITE_SUPABASE_URL;
// 새 대시보드의 Publishable key와 예전 anon 키 둘 다 받는다
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const api: Api =
  url && anonKey ? supabaseApi(createClient(url, anonKey, { auth: { persistSession: true } })) : localApi();
