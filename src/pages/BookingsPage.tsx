import { useState } from 'react';
import { api, type Booking, type BookingStatus } from '../lib/api';
import { activityById, cardById, suggestCards } from '../lib/content';
import { formatDate, go, todayKey } from '../lib/router';
import { isLive, profileById, type AppData } from '../lib/store';
import { ActivityTitle, Avatar, PersonLine } from './common';

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: '수락 대기',
  accepted: '약속 확정',
  declined: '거절됨',
  cancelled: '취소됨',
  done: '다녀옴',
};

async function setStatus(data: AppData, b: Booking, status: BookingStatus) {
  await api.updateBooking(b.id, { status });
  await data.refresh();
}

/** 04 · 만남 약속: 예약 현황 */
export function BookingsPage({ data }: { data: AppData }) {
  const me = data.me!;
  const incoming = data.bookings.filter((b) => b.status === 'pending' && b.requested_by !== me.id);
  const upcoming = data.bookings.filter((b) => isLive(b) && !incoming.includes(b));
  const past = data.bookings.filter((b) => !isLive(b)).reverse();

  return (
    <div className="page narrow">
      <p className="eyebrow">04 · 만남 약속</p>
      <h1>예약 현황</h1>
      {data.bookings.length === 0 && (
        <div className="empty">
          아직 약속이 없어요.{' '}
          <button className="link" onClick={() => go('/')}>
            {me.role === 'foreigner' ? '가고 싶은 곳 찾아보기' : '외국인 친구 찾아보기'}
          </button>
        </div>
      )}
      {incoming.length > 0 && <BookingGroup title="받은 요청" list={incoming} data={data} />}
      {upcoming.length > 0 && <BookingGroup title="다가오는 약속" list={upcoming} data={data} />}
      {past.length > 0 && <BookingGroup title="지난 약속" list={past} data={data} />}
    </div>
  );
}

function BookingGroup({ title, list, data }: { title: string; list: Booking[]; data: AppData }) {
  return (
    <section>
      <h2 className="section">{title} <small>{list.length}</small></h2>
      <div className="stack">
        {list.map((b) => <BookingItem key={b.id} b={b} data={data} />)}
      </div>
    </section>
  );
}

function BookingItem({ b, data }: { b: Booking; data: AppData }) {
  const me = data.me!;
  const partner = profileById(data, me.role === 'foreigner' ? b.local_id : b.foreigner_id);
  const mineRequest = b.requested_by === me.id;
  const arrived = b.date <= todayKey();

  return (
    <article className={`card booking st-${b.status}`}>
      <div className="booking-top">
        <span className={`status st-${b.status}`}>{STATUS_LABEL[b.status]}</span>
        <span className="when">{formatDate(b.date)} · {b.time}</span>
      </div>
      <h3><ActivityTitle id={b.activity_id} /></h3>
      {partner && (
        <div className="person-head small">
          <Avatar p={partner} size={32} />
          <div>
            <b>{partner.name}</b>
            <PersonLine p={partner} />
          </div>
        </div>
      )}
      {b.message && (
        <p className="msg">
          <small>{mineRequest ? '내가 보낸 말' : `${partner?.name ?? '상대'}님의 말`}</small>
          {b.message}
        </p>
      )}
      {b.status === 'accepted' && (
        <p className="hint">
          {me.role === 'foreigner'
            ? `대화 카드 ${b.cards.length}장 저장됨`
            : `상대가 준비한 대화 카드 ${b.cards.length}장`}
        </p>
      )}
      <div className="actions">
        {b.status === 'pending' && !mineRequest && (
          <>
            <button className="btn primary" onClick={() => setStatus(data, b, 'accepted')}>수락</button>
            <button className="btn ghost" onClick={() => setStatus(data, b, 'declined')}>거절</button>
          </>
        )}
        {b.status === 'pending' && mineRequest && (
          <button className="btn ghost" onClick={() => setStatus(data, b, 'cancelled')}>요청 취소</button>
        )}
        {b.status === 'accepted' && (
          <>
            <button className="btn primary" onClick={() => go(`/booking/${b.id}`)}>
              {me.role === 'foreigner' ? '대화 카드 준비' : '대화 준비 보기'}
            </button>
            {arrived && <button className="btn" onClick={() => setStatus(data, b, 'done')}>다녀왔어요</button>}
            <button className="btn ghost" onClick={() => confirm('이 약속을 취소할까요?') && setStatus(data, b, 'cancelled')}>
              약속 취소
            </button>
          </>
        )}
        {b.status === 'done' && b.cards.length > 0 && (
          <button className="btn ghost" onClick={() => go(`/booking/${b.id}`)}>그날의 대화 카드</button>
        )}
      </div>
    </article>
  );
}

/** 05 · 말할 준비: 자동 제안된 대화 소재를 골라 약속에 저장하고, 당일 열어본다 */
export function BookingDetailPage({ data, id }: { data: AppData; id: string }) {
  const b = data.bookings.find((x) => x.id === id);
  const [viewing, setViewing] = useState(false);
  // 콘텐츠 목록에서 빠진 활동(예: 예전 공주 파일럿)의 약속이면 열 수 없다
  const a = b && activityById(b.activity_id);
  if (!b || !a) return <div className="page"><p className="empty">약속을 찾을 수 없어요.</p></div>;

  const me = data.me!;
  const foreigner = profileById(data, b.foreigner_id);
  const partner = profileById(data, me.role === 'foreigner' ? b.local_id : b.foreigner_id);
  const level = foreigner?.topik_level ?? 1;
  const saved = new Set(b.cards);
  const editable = me.role === 'foreigner' && b.status === 'accepted';
  const suggestions = suggestCards(level, a);

  const toggle = async (cardId: string) => {
    const next = saved.has(cardId) ? b.cards.filter((c) => c !== cardId) : [...b.cards, cardId];
    await api.updateBooking(b.id, { cards: next });
    await data.refresh();
  };

  const savedCards = b.cards.map(cardById).filter((c) => !!c);

  return (
    <div className="page narrow">
      <button className="link" onClick={() => go('/bookings')}>← 예약 현황</button>
      <p className="eyebrow">05 · 말할 준비</p>
      <h1>{a.title}</h1>
      <p className="sub">
        {formatDate(b.date)} {b.time} · {partner?.name}님과
      </p>

      {me.role === 'local' ? (
        <div className="card pad tip">
          <h3>{foreigner?.name}님은 TOPIK {level}급이에요</h3>
          <p>
            {level <= 2
              ? '짧은 문장으로 천천히, 손짓과 사진을 함께 써 주세요.'
              : level <= 4
                ? '보통 속도로 말해도 괜찮아요. 어려운 한자어는 쉬운 말로 한 번 더 풀어 주세요.'
                : '자유롭게 이야기해도 좋아요. 동네의 깊은 이야기를 들려주세요.'}
          </p>
          <p>아래는 친구가 미리 골라 둔 대화 소재예요. 이 질문들이 나오면 반갑게 받아 주세요.</p>
        </div>
      ) : (
        <p className="sub">
          TOPIK {level}급에 맞춰 자동으로 골랐어요. 쓰고 싶은 카드를 저장하면 당일에 바로 열어볼 수 있어요.
        </p>
      )}

      {savedCards.length > 0 && (
        <button className="btn primary full" onClick={() => setViewing(true)}>
          저장한 카드 {savedCards.length}장 당일 열어보기
        </button>
      )}

      {editable ? (
        <div className="talk-list">
          {suggestions.map((c) => (
            <button key={c.id} className={`talk ${saved.has(c.id) ? 'on' : ''}`} onClick={() => toggle(c.id)}>
              <span className="lv">{c.level}급</span>
              <span className="talk-text">
                <b>{c.ko}</b>
                <small>{c.en}</small>
              </span>
              <span className="save">{saved.has(c.id) ? '저장됨' : '+ 저장'}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="talk-list">
          {savedCards.length === 0 && <p className="empty">아직 저장한 대화 카드가 없어요.</p>}
          {savedCards.map((c) => (
            <div key={c.id} className="talk on static">
              <span className="lv">{c.level}급</span>
              <span className="talk-text"><b>{c.ko}</b><small>{c.en}</small></span>
            </div>
          ))}
        </div>
      )}

      {viewing && <DayOfViewer cards={savedCards} onClose={() => setViewing(false)} />}
    </div>
  );
}

function DayOfViewer({ cards, onClose }: { cards: { id: string; ko: string; en: string }[]; onClose: () => void }) {
  const [i, setI] = useState(0);
  const c = cards[i];
  return (
    <div className="dayof" role="dialog" aria-label="당일 대화 카드">
      <button className="icon-btn close" onClick={onClose} aria-label="닫기">✕</button>
      <p className="counter">{i + 1} / {cards.length}</p>
      <p className="big-ko">{c.ko}</p>
      <p className="big-en">{c.en}</p>
      <div className="dayof-nav">
        <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>이전</button>
        <button className="btn primary" disabled={i === cards.length - 1} onClick={() => setI(i + 1)}>다음</button>
      </div>
    </div>
  );
}
