import { useCallback, useEffect, useState } from 'react';
import { api, type Booking, type Interest, type Profile, type Role, type UserMeta } from './api';

export interface AppData {
  ready: boolean;
  userId: string | null;
  me: Profile | null;
  meta: UserMeta;
  profiles: Profile[];
  interests: Interest[];
  bookings: Booking[];
  refresh: () => Promise<void>;
}

export function useAppData(): AppData {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<UserMeta>({});

  const load = useCallback(async (uid: string | null) => {
    if (uid) {
      const [p, i, b, m] = await Promise.all([api.profiles(), api.interests(), api.bookings(uid), api.userMeta()]);
      setMeta(m);
      setProfiles(p);
      setInterests(i);
      setBookings(b);
    } else {
      setProfiles([]);
      setInterests([]);
      setBookings([]);
      setMeta({});
    }
    setUserId(uid);
    setReady(true);
  }, []);

  useEffect(() => {
    api.currentUserId().then(load);
    return api.onAuthChange(load);
  }, [load]);

  const refresh = useCallback(() => load(userId), [load, userId]);

  // 상대가 수락·취소한 것이 보이도록 창으로 돌아올 때와 30초마다 다시 읽는다
  useEffect(() => {
    if (!userId) return;
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    const t = setInterval(onFocus, 30_000);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(t);
    };
  }, [userId, refresh]);

  const me = profiles.find((p) => p.id === userId) ?? null;
  return { ready, userId, me, meta, profiles, interests, bookings, refresh };
}

export function otherRole(role: Role): Role {
  return role === 'foreigner' ? 'local' : 'foreigner';
}

/** 이 활동에 관심을 표시한 반대편 사람들 = 매칭 후보 */
export function matchesFor(data: AppData, activityId: string): Profile[] {
  if (!data.me) return [];
  const want = otherRole(data.me.role);
  const ids = new Set(data.interests.filter((i) => i.activity_id === activityId).map((i) => i.user_id));
  return data.profiles.filter((p) => p.role === want && ids.has(p.id));
}

export function myInterestIds(data: AppData): Set<string> {
  return new Set(data.interests.filter((i) => i.user_id === data.userId).map((i) => i.activity_id));
}

export function interestIdsOf(data: AppData, userId: string): string[] {
  return data.interests.filter((i) => i.user_id === userId).map((i) => i.activity_id);
}

export function profileById(data: AppData, id: string): Profile | undefined {
  return data.profiles.find((p) => p.id === id);
}

/** 아직 진행 중인(거절·취소되지 않은) 약속 */
export function isLive(b: Booking): boolean {
  return b.status === 'pending' || b.status === 'accepted';
}
