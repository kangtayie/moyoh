import { useState } from 'react';
import { api, GENDER_LABEL, type Gender, type Profile } from '../lib/api';
import { KOREA, NATIONALITIES } from '../lib/nationalities';
import { go } from '../lib/router';
import type { AppData } from '../lib/store';

const THIS_YEAR = new Date().getFullYear();

/** 사전 등록한 사람이 처음 로그인했을 때 받는 추가 정보. 역할·급수·활동은 설문 값을 그대로 쓴다 */
export function FirstProfilePage({ data }: { data: AppData }) {
  const meta = data.meta;
  const role = meta.role ?? 'foreigner';
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [nationality, setNationality] = useState(role === 'local' ? KOREA : '');
  const [bio, setBio] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const year = Number(birthYear);
  const validYear = /^\d{4}$/.test(birthYear) && year >= 1930 && year <= THIS_YEAR - 10;
  const valid = name.trim() && validYear && gender && nationality && bio.trim();

  const save = async () => {
    if (!valid) return;
    setBusy(true);
    setError('');
    try {
      const profile: Profile = {
        id: data.userId!,
        role,
        name: name.trim(),
        nationality,
        birth_year: year,
        gender,
        topik_level: role === 'foreigner' ? (meta.topik_level ?? null) : null,
        neighborhood: role === 'local' ? (meta.region ?? null) : null,
        available: null,
        bio: bio.trim(),
      };
      await api.saveProfile(profile);
      for (const id of meta.activities ?? []) await api.setInterest(profile.id, id, true);
      await data.refresh();
      go('/');
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className={`page narrow role-${role}`}>
      <p className="eyebrow">처음 오셨네요</p>
      <h1>나를 소개해 주세요</h1>
      <p className="sub">설문에 참여해 주셔서 가입은 이미 되어 있어요. 아래 내용만 적으면 바로 시작할 수 있어요.</p>

      <div className="form">
        <label className="field">
          <span>이름 또는 닉네임 (상대에게 보여요)</span>
          <input value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="예시) Linh" />
        </label>
        <label className="field">
          <span>출생년도</span>
          <input
            inputMode="numeric"
            maxLength={4}
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, ''))}
            placeholder="예시) 2004"
          />
        </label>
        {birthYear.length === 4 && !validYear && <p className="error">출생년도를 다시 확인해 주세요.</p>}
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
        <label className="field">
          <span>국적</span>
          <select value={nationality} onChange={(e) => setNationality(e.target.value)}>
            <option value="" disabled>국적을 골라 주세요</option>
            {NATIONALITIES.map((n) => (
              <option key={n.ko} value={n.ko}>{n.ko} · {n.en}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>나를 설명하는 한 문장</span>
          <input value={bio} maxLength={100} onChange={(e) => setBio(e.target.value)} placeholder="예시) 시장 음식과 사진 찍는 걸 좋아해요." />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary full" disabled={!valid || busy} onClick={save}>모여 시작하기</button>
      </div>
    </div>
  );
}
