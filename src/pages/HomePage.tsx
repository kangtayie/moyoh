import { useState } from 'react';
import { api, type Profile } from '../lib/api';
import { ACTIVITIES, FIT_LABEL, REGIONS, fitFor, recommend, type Activity, type Region } from '../lib/content';
import { go } from '../lib/router';
import { interestIdsOf, matchesFor, myInterestIds, type AppData } from '../lib/store';
import { Avatar, BookingSheet, PersonLine } from './common';

export function HomePage({ data }: { data: AppData }) {
  return data.me!.role === 'foreigner' ? <ForeignerHome data={data} /> : <LocalHome data={data} />;
}

// ---------- 외국인: 02 · 가고 싶은 곳 ----------

const CATEGORIES = ['전체', '역사', '시장·음식', '골목·문화', '자연', '체험'] as const;

function ForeignerHome({ data }: { data: AppData }) {
  const me = data.me!;
  const level = me.topik_level ?? 1;
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('전체');
  const [region, setRegion] = useState<Region | '전체'>('전체');
  const list = recommend(level).filter(
    (a) => (cat === '전체' || a.category === cat) && (region === '전체' || a.region === region),
  );

  return (
    <div className="page">
      <p className="eyebrow">02 · 가고 싶은 곳</p>
      <h1>{me.name}님께 추천하는 서울·경기</h1>
      <p className="sub">
        TOPIK {level}급 기준으로, 주민과 한국어로 이야기하기 좋은 순서예요.{' '}
        <button className="link" onClick={() => go('/me')}>급수 바꾸기</button>
      </p>
      <div className="seg region-seg">
        {(['전체', ...REGIONS] as const).map((r) => (
          <button key={r} className={region === r ? 'on' : ''} onClick={() => setRegion(r)}>{r}</button>
        ))}
      </div>
      <div className="chips scroll">
        {CATEGORIES.map((c) => (
          <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <div className="grid">
        {list.map((a) => (
          <ActivityCard key={a.id} data={data} activity={a} level={level} />
        ))}
      </div>
    </div>
  );
}

export function ActivityCard({ data, activity: a, level }: { data: AppData; activity: Activity; level?: number }) {
  const hosts = matchesFor(data, a.id);
  const liked = myInterestIds(data).has(a.id);
  const fit = level ? fitFor(level, a) : null;
  return (
    <article className="card activity" onClick={() => go(`/activity/${a.id}`)}>
      <div className={`thumb cat-${a.category.replace('·', '')}`}>
        <span>{a.region} · {a.place}</span>
      </div>
      <div className="activity-body">
        <div className="tags">
          <span className="tag">{a.category}</span>
          {fit && <span className={`tag fit-${fit}`}>{FIT_LABEL[fit]}</span>}
          <span className="tag plain">{a.duration}</span>
        </div>
        <h3>{a.title}</h3>
        <p className="why">{a.why}</p>
        <div className="activity-foot">
          <span className="count">
            {data.me!.role === 'foreigner' ? `동행 가능한 주민 ${hosts.length}명` : `가고 싶어 하는 친구 ${hosts.length}명`}
          </span>
          {data.me!.role === 'foreigner' && <LikeButton data={data} activityId={a.id} liked={liked} />}
        </div>
      </div>
    </article>
  );
}

export function LikeButton({ data, activityId, liked }: { data: AppData; activityId: string; liked: boolean }) {
  return (
    <button
      className={`like ${liked ? 'on' : ''}`}
      onClick={async (e) => {
        e.stopPropagation();
        await api.setInterest(data.userId!, activityId, !liked);
        await data.refresh();
      }}
      aria-pressed={liked}
      title="가고 싶어요를 누르면 주민이 먼저 함께 가자고 제안할 수 있어요"
    >
      {liked ? '♥ 가고 싶어요' : '♡ 가고 싶어요'}
    </button>
  );
}

// ---------- 주민: 외국인 친구 찾기 ----------

function LocalHome({ data }: { data: AppData }) {
  const me = data.me!;
  const mine = new Set(interestIdsOf(data, me.id));
  const [proposeTo, setProposeTo] = useState<Profile | null>(null);
  const incoming = data.bookings.filter((b) => b.status === 'pending' && b.requested_by !== me.id);

  // 내가 안내하는 활동에 가고 싶어 하는 외국인 = 매칭 후보. 겹치는 활동이 많은 순
  const candidates = data.profiles
    .filter((p) => p.role === 'foreigner')
    .map((p) => ({ p, shared: interestIdsOf(data, p.id).filter((id) => mine.has(id)) }))
    .filter((c) => c.shared.length > 0)
    .sort((a, b) => b.shared.length - a.shared.length);
  const others = data.profiles.filter((p) => p.role === 'foreigner' && !candidates.some((c) => c.p.id === p.id));

  return (
    <div className="page">
      <p className="eyebrow">주민 · 친구 찾기</p>
      <h1>{me.name}님과 동네를 함께 걸을 친구들</h1>
      <p className="sub">내가 안내할 수 있는 활동에 ‘가고 싶어요’를 누른 외국인 친구예요.</p>

      {incoming.length > 0 && (
        <button className="banner" onClick={() => go('/bookings')}>
          <b>새 동행 요청 {incoming.length}건</b>
          <span>확인하고 수락해 주세요 →</span>
        </button>
      )}

      {candidates.length === 0 ? (
        <div className="empty">
          아직 내 활동과 맞는 친구가 없어요. <button className="link" onClick={() => go('/me')}>함께할 활동을 더 고르면</button> 더 많이 만날 수 있어요.
        </div>
      ) : (
        <div className="grid people">
          {candidates.map(({ p, shared }) => (
            <PersonCard key={p.id} p={p} sharedIds={shared} onPropose={() => setProposeTo(p)} />
          ))}
        </div>
      )}

      {others.length > 0 && (
        <>
          <h2 className="section">다른 활동에 관심 있는 친구</h2>
          <div className="grid people">
            {others.map((p) => (
              <PersonCard key={p.id} p={p} sharedIds={interestIdsOf(data, p.id)} dim onPropose={() => setProposeTo(p)} />
            ))}
          </div>
        </>
      )}

      <h2 className="section">서울·경기·인천 활동 둘러보기</h2>
      <div className="grid">
        {ACTIVITIES.map((a) => (
          <ActivityCard key={a.id} data={data} activity={a} />
        ))}
      </div>

      {proposeTo && <BookingSheet data={data} partner={proposeTo} onClose={() => setProposeTo(null)} />}
    </div>
  );
}

export function PersonCard({
  p,
  sharedIds,
  onPropose,
  dim,
  cta,
}: {
  p: Profile;
  sharedIds: string[];
  onPropose: () => void;
  dim?: boolean;
  cta?: string;
}) {
  return (
    <article className={`card person ${dim ? 'dim' : ''}`}>
      <div className="person-head">
        <Avatar p={p} />
        <div>
          <b>{p.name}</b>
          <PersonLine p={p} />
        </div>
      </div>
      {p.bio && <p className="bio">“{p.bio}”</p>}
      {sharedIds.length > 0 && (
        <div className="tags">
          {sharedIds.map((id) => {
            const a = ACTIVITIES.find((x) => x.id === id);
            return a ? <span key={id} className="tag">{a.title}</span> : null;
          })}
        </div>
      )}
      <button className="btn primary" onClick={onPropose}>
        {cta ?? (p.role === 'foreigner' ? '함께 가자고 제안' : '주민 동행 예약')}
      </button>
    </article>
  );
}
