import { useState } from 'react';
import { api, GENDER_LABEL, type Profile } from '../lib/api';
import { ACTIVITIES, activityById, type Activity } from '../lib/content';
import { formatDate, go, todayKey } from '../lib/router';
import type { AppData } from '../lib/store';

export function Avatar({ p, size = 44 }: { p: Profile; size?: number }) {
  return (
    <span className={`avatar ${p.role}`} style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden="true">
      {p.name.slice(0, 1)}
    </span>
  );
}

export function PersonLine({ p }: { p: Profile }) {
  return (
    <span className="person-line">
      {p.gender ? `${GENDER_LABEL[p.gender]} · ` : ''}
      {p.role === 'foreigner' ? `${p.nationality}${p.topik_level ? ` · TOPIK ${p.topik_level}급` : ''}` : `${p.neighborhood ?? ''} 주민`.trim()}
      {p.role === 'local' && p.available ? ` · ${p.available}` : ''}
    </span>
  );
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="닫기">✕</button>
        </header>
        {children}
      </div>
    </div>
  );
}

const TIMES = ['10:00', '14:00', '17:00'];

/** 04 · 만남 약속. 외국인은 주민에게 동행을, 주민은 외국인에게 함께 가자고 요청한다 */
export function BookingSheet({
  data,
  partner,
  activity,
  onClose,
}: {
  data: AppData;
  partner: Profile;
  activity?: Activity;
  onClose: () => void;
}) {
  const me = data.me!;
  // 활동을 정하지 않고 열었으면 두 사람이 겹치는 활동 중에서 고른다
  const shared = ACTIVITIES.filter((a) =>
    data.interests.some((i) => i.user_id === partner.id && i.activity_id === a.id),
  );
  const options = activity ? [activity] : shared.length ? shared : ACTIVITIES;
  const [activityId, setActivityId] = useState(options[0].id);
  const [date, setDate] = useState('');
  const [time, setTime] = useState(TIMES[1]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const foreigner = me.role === 'foreigner' ? me : partner;
      const local = me.role === 'local' ? me : partner;
      await api.createBooking(me.id, {
        activity_id: activityId,
        foreigner_id: foreigner.id,
        local_id: local.id,
        date,
        time,
        message: message.trim(),
      });
      await data.refresh();
      onClose();
      go('/bookings');
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <Sheet title={me.role === 'foreigner' ? '주민 동행 예약' : '함께 가자고 제안하기'} onClose={onClose}>
      <div className="sheet-person">
        <Avatar p={partner} />
        <div>
          <b>{partner.name}</b>
          <PersonLine p={partner} />
        </div>
      </div>
      <div className="form">
        <label className="field">
          <span>활동</span>
          <select value={activityId} onChange={(e) => setActivityId(e.target.value)} disabled={options.length === 1}>
            {options.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </label>
        <div className="row2">
          <label className="field">
            <span>날짜</span>
            <input type="date" min={todayKey()} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span>시간</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
        </div>
        <div className="chips">
          {TIMES.map((t) => (
            <button key={t} type="button" className={`chip ${time === t ? 'on' : ''}`} onClick={() => setTime(t)}>
              {t === '10:00' ? '오전 10시' : t === '14:00' ? '오후 2시' : '오후 5시'}
            </button>
          ))}
        </div>
        <label className="field">
          <span>인사 한마디</span>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={me.role === 'foreigner' ? '안녕하세요! 시장 구경을 같이 하고 싶어요.' : '안녕하세요, 제가 공산성 길을 안내해 드릴게요!'}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary full" disabled={!date || !time || busy} onClick={submit}>
          {date ? `${formatDate(date)} ${time} 요청 보내기` : '날짜를 골라 주세요'}
        </button>
        <p className="hint center">상대가 수락하면 약속이 확정돼요. 예약 현황에서 언제든 취소할 수 있어요.</p>
      </div>
    </Sheet>
  );
}

export function ActivityTitle({ id }: { id: string }) {
  const a = activityById(id);
  return <>{a ? a.title : '알 수 없는 활동'}</>;
}
