import { useState } from 'react';
import { api, GENDER_LABEL, type Gender, type Profile, type Role } from '../lib/api';
import { ACTIVITIES } from '../lib/content';
import { NATIONALITIES } from '../lib/nationalities';
import { go } from '../lib/router';
import { interestIdsOf, type AppData } from '../lib/store';

export const TOPIK_DESC: Record<number, string> = {
  1: '인사, 자기소개, 물건 사기',
  2: '일상 대화, 길 묻기, 주문하기',
  3: '익숙한 주제로 이야기 이어가기',
  4: '뉴스·역사 이야기를 대강 이해',
  5: '사회 주제로 의견 나누기',
  6: '거의 모든 주제로 자유롭게',
};

/** 가입 직후(onboarding)와 '나' 탭에서 함께 쓰는 프로필 편집 */
export function ProfilePage({ data, onboarding }: { data: AppData; onboarding?: boolean }) {
  const userId = data.userId!;
  const existing = data.me;
  const [role, setRole] = useState<Role | null>(existing?.role ?? null);
  const [name, setName] = useState(existing?.name ?? '');
  const [nationality, setNationality] = useState(existing?.nationality ?? '');
  const [level, setLevel] = useState<number | null>(existing?.topik_level ?? null);
  const [gender, setGender] = useState<Gender | null>(existing?.gender ?? null);
  const [neighborhood, setNeighborhood] = useState(existing?.neighborhood ?? '');
  const [available, setAvailable] = useState(existing?.available ?? '');
  const [bio, setBio] = useState(existing?.bio ?? '');
  const [picked, setPicked] = useState<Set<string>>(() => new Set(interestIdsOf(data, userId)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!role) {
    return (
      <div className="page narrow">
        <p className="eyebrow">시작하기</p>
        <h1>어떤 분이세요?</h1>
        <p className="sub">선택한 쪽의 반대편 사람과 매칭돼요.</p>
        <div className="role-pick">
          <button className="role-card blue" onClick={() => setRole('foreigner')}>
            <b>한국어를 배우는 외국인이에요</b>
            <span>서울·경기·인천의 장소를 추천받고, 함께 갈 한국인 주민을 만나요.</span>
          </button>
          <button className="role-card orange" onClick={() => setRole('local')}>
            <b>수도권에 사는 한국인이에요</b>
            <span>우리 동네를 함께 경험할 외국인 친구를 만나요.</span>
          </button>
        </div>
      </div>
    );
  }

  const valid = name.trim() && gender && (role === 'local' ? neighborhood.trim() && picked.size > 0 : level && nationality.trim());

  const save = async () => {
    if (!valid) return;
    setBusy(true);
    setError('');
    try {
      const profile: Profile = {
        id: userId,
        role,
        name: name.trim(),
        // 주민도 첫 로그인에서 고른 국적·출생년도는 지우지 않는다
        nationality: role === 'foreigner' ? nationality : (existing?.nationality ?? null),
        birth_year: existing?.birth_year ?? null,
        topik_level: role === 'foreigner' ? level : null,
        gender,
        neighborhood: role === 'local' ? neighborhood.trim() : null,
        available: role === 'local' ? available.trim() : null,
        bio: bio.trim(),
      };
      await api.saveProfile(profile);
      if (role === 'local') {
        const before = new Set(interestIdsOf(data, userId));
        for (const a of ACTIVITIES) {
          if (before.has(a.id) !== picked.has(a.id)) await api.setInterest(userId, a.id, picked.has(a.id));
        }
      }
      await data.refresh();
      go('/');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = (id: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="page narrow">
      {onboarding && (
        <button className="link" onClick={() => setRole(null)}>← 다시 고르기</button>
      )}
      <p className="eyebrow">{role === 'foreigner' ? '01 · 수준 입력' : '주민 프로필'}</p>
      <h1>{onboarding ? (role === 'foreigner' ? '한국어 수준을 알려 주세요' : '함께할 수 있는 것을 알려 주세요') : '내 프로필'}</h1>
      <p className="sub">
        {role === 'foreigner'
          ? 'TOPIK 급수가 추천의 출발점이 돼요. 시험을 안 봤다면 비슷한 수준을 골라 주세요.'
          : '고른 활동을 가고 싶어 하는 외국인 친구에게 내 프로필이 보여요.'}
      </p>

      <div className="form">
        <label className="field">
          <span>이름 (상대에게 보여요)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={role === 'foreigner' ? '예시) Linh' : '예시) 김영숙'} />
        </label>

        <div className="field">
          <span>성별 (상대에게 보여요)</span>
          <div className="seg gender-seg">
            {(Object.keys(GENDER_LABEL) as Gender[]).map((g) => (
              <button key={g} type="button" className={gender === g ? 'on' : ''} onClick={() => setGender(g)}>
                {GENDER_LABEL[g]}
              </button>
            ))}
          </div>
        </div>

        {role === 'foreigner' ? (
          <>
            <label className="field">
              <span>국적</span>
              <select value={nationality} onChange={(e) => setNationality(e.target.value)}>
                <option value="" disabled>국적을 골라 주세요</option>
                {/* 예전에 직접 적은 국적이 목록에 없어도 그대로 보여 준다 */}
                {nationality && !NATIONALITIES.some((n) => n.ko === nationality) && <option value={nationality}>{nationality}</option>}
                {NATIONALITIES.map((n) => (
                  <option key={n.ko} value={n.ko}>{n.ko} · {n.en}</option>
                ))}
              </select>
            </label>
            <div className="field">
              <span>TOPIK 급수</span>
              <div className="topik-grid">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button key={n} type="button" className={`topik ${level === n ? 'on' : ''}`} onClick={() => setLevel(n)}>
                    <b>{n}급</b>
                    <small>{TOPIK_DESC[n]}</small>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <label className="field">
              <span>사는 동네</span>
              <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="예시) 서울 마포구 망원동" />
            </label>
            <label className="field">
              <span>주로 시간이 되는 때</span>
              <input value={available} onChange={(e) => setAvailable(e.target.value)} placeholder="예시) 주말 오후, 평일 저녁" />
            </label>
            <div className="field">
              <span>함께해 줄 수 있는 활동 (1개 이상)</span>
              <div className="pick-list">
                {ACTIVITIES.map((a) => (
                  <button key={a.id} type="button" className={`pick ${picked.has(a.id) ? 'on' : ''}`} onClick={() => toggle(a.id)}>
                    <span className="check" aria-hidden="true">{picked.has(a.id) ? '✓' : ''}</span>
                    <span>
                      <b>{a.title}</b>
                      <small>{a.place} · {a.duration}</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <label className="field">
          <span>한 줄 소개</span>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={role === 'foreigner' ? '좋아하는 것, 한국어를 배우는 이유' : '어떤 이야기를 나누고 싶은지, 동네 자랑'}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary full" disabled={!valid || busy} onClick={save}>
          {onboarding ? (role === 'foreigner' ? '추천 보기' : '외국인 친구 찾기') : '저장'}
        </button>
        {!onboarding && (
          <button className="btn ghost full" onClick={() => api.signOut()}>로그아웃</button>
        )}
      </div>
    </div>
  );
}
