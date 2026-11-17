import { useState } from 'react';
import { api, type Profile } from '../lib/api';
import { FIT_LABEL, activityById, fitFor, suggestCards } from '../lib/content';
import { go } from '../lib/router';
import { interestIdsOf, matchesFor, myInterestIds, type AppData } from '../lib/store';
import { BookingSheet } from './common';
import { LikeButton, PersonCard } from './HomePage';

/** 03 · 만나고 싶은 사람: 활동 소개와 함께할 반대편 사람들 */
export function ActivityPage({ data, id }: { data: AppData; id: string }) {
  const a = activityById(id);
  const [bookWith, setBookWith] = useState<Profile | null>(null);
  if (!a) return <div className="page"><p className="empty">찾을 수 없는 활동이에요.</p></div>;

  const me = data.me!;
  const isForeigner = me.role === 'foreigner';
  const level = me.topik_level ?? 1;
  const people = matchesFor(data, a.id);
  const mine = myInterestIds(data).has(a.id);
  const fit = isForeigner ? fitFor(level, a) : null;
  const preview = isForeigner ? suggestCards(level, a).slice(0, 3) : a.cards.slice(0, 3);

  return (
    <div className="page">
      <button className="link" onClick={() => history.back()}>← 뒤로</button>
      <div className={`hero thumb cat-${a.category.replace('·', '')}`}>
        <span>{a.place} · {a.region} {a.district}</span>
      </div>
      <p className="eyebrow">03 · 활동과 {isForeigner ? '주민' : '친구'} 알아보기</p>
      <h1>{a.title}</h1>
      <div className="tags">
        <span className="tag">{a.category}</span>
        {fit && <span className={`tag fit-${fit}`}>{FIT_LABEL[fit]}</span>}
        <span className="tag plain">권장 TOPIK {a.level}급 이상</span>
        <span className="tag plain">{a.duration}</span>
      </div>
      <p className="lead">{a.summary}</p>

      <div className="two-col">
        <section className="card pad">
          <h3>왜 가 볼 만한가요</h3>
          <p>{a.why}</p>
          <h3>그곳에서 할 수 있는 것</h3>
          <ul>{a.todo.map((t) => <li key={t}>{t}</li>)}</ul>
        </section>
        <section className="card pad">
          <h3>나눌 수 있는 이야기</h3>
          <ul>{a.talkAbout.map((t) => <li key={t}>{t}</li>)}</ul>
          <h3>이런 말을 해 볼 수 있어요</h3>
          <ul className="phrases">
            {preview.map((c) => (
              <li key={c.id}><b>{c.ko}</b><small>{c.en}</small></li>
            ))}
          </ul>
        </section>
      </div>

      <div className="section-head">
        <h2 className="section">
          {isForeigner ? `함께할 수 있는 주민 ${people.length}명` : `이 활동을 가고 싶어 하는 친구 ${people.length}명`}
        </h2>
        {isForeigner ? (
          <LikeButton data={data} activityId={a.id} liked={mine} />
        ) : (
          <button
            className={`btn ${mine ? 'ghost' : 'primary'}`}
            onClick={async () => {
              await api.setInterest(me.id, a.id, !mine);
              await data.refresh();
            }}
          >
            {mine ? '✓ 내가 안내하는 활동' : '나도 함께할 수 있어요'}
          </button>
        )}
      </div>

      {people.length === 0 ? (
        <p className="empty">
          {isForeigner
            ? '아직 이 활동을 안내하는 주민이 없어요. ‘가고 싶어요’를 눌러 두면 주민이 먼저 제안할 수 있어요.'
            : '아직 이 활동을 원하는 친구가 없어요.'}
        </p>
      ) : (
        <div className="grid people">
          {people.map((p) => (
            <PersonCard
              key={p.id}
              p={p}
              sharedIds={isForeigner ? [] : interestIdsOf(data, p.id).filter((x) => x !== a.id)}
              onPropose={() => setBookWith(p)}
            />
          ))}
        </div>
      )}

      {bookWith && <BookingSheet data={data} partner={bookWith} activity={a} onClose={() => setBookWith(null)} />}
      {isForeigner && people.length > 0 && (
        <p className="hint center">예약을 보내면 <button className="link" onClick={() => go('/bookings')}>예약 현황</button>에서 확인할 수 있어요.</p>
      )}
    </div>
  );
}
