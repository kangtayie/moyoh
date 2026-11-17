import { ACTIVITIES } from '../lib/content';
import { go } from '../lib/router';
import { matchesFor, myInterestIds, type AppData } from '../lib/store';

type PinState = 'visited' | 'planned' | 'wish' | 'none';

/** 재방문 연결: 다녀온 곳은 지도에 쌓이고, 아직 못 간 곳·사람은 다음 탐험의 이유가 된다 */
export function MapPage({ data }: { data: AppData }) {
  const me = data.me!;
  const wish = myInterestIds(data);
  const stateOf = (id: string): PinState => {
    const bs = data.bookings.filter((b) => b.activity_id === id);
    if (bs.some((b) => b.status === 'done')) return 'visited';
    if (bs.some((b) => b.status === 'accepted' || b.status === 'pending')) return 'planned';
    if (wish.has(id)) return 'wish';
    return 'none';
  };
  const visited = ACTIVITIES.filter((a) => stateOf(a.id) === 'visited');
  const next = ACTIVITIES.filter((a) => stateOf(a.id) !== 'visited');
  const metPeople = new Set(
    data.bookings.filter((b) => b.status === 'done').map((b) => (me.role === 'foreigner' ? b.local_id : b.foreigner_id)),
  );

  return (
    <div className="page">
      <p className="eyebrow">재방문</p>
      <h1>나의 수도권 지도</h1>
      <p className="sub">
        다녀온 곳 {visited.length}곳 · 만난 {me.role === 'foreigner' ? '주민' : '친구'} {metPeople.size}명
      </p>

      <div className="card map-card">
        <svg viewBox="0 0 100 80" className="map" role="img" aria-label="서울·경기·인천 개략 지도">
          <rect x="1" y="1" width="98" height="78" rx="6" className="region" />
          <rect x="0" y="30" width="14" height="26" rx="3" className="region incheon" />
          <ellipse cx="50" cy="31" rx="25" ry="22" className="seoul" />
          <path d="M-2 50 C 15 48, 28 45, 40 48 S 60 54, 74 44 S 92 34, 102 34" className="river" />
          <text x="34" y="14" className="map-label">서울</text>
          <text x="90" y="75" className="map-label">경기</text>
          <text x="2" y="34.5" className="map-label">인천</text>
          <text x="80" y="44" className="map-label">한강</text>
          {ACTIVITIES.map((a) => {
            const st = stateOf(a.id);
            // 오른쪽 끝 장소는 이름을 왼쪽에 붙여 지도 밖으로 안 나가게 한다
            const right = a.x > 78;
            return (
              <g key={a.id} className={`pin pin-${st}`} onClick={() => go(`/activity/${a.id}`)}>
                <circle cx={a.x} cy={a.y} r={st === 'none' ? 1.4 : 1.9} />
                <text x={right ? a.x - 3 : a.x + 3} y={a.y + 1.2} textAnchor={right ? 'end' : 'start'}>{a.pin}</text>
              </g>
            );
          })}
        </svg>
        <div className="legend">
          <span><i className="dot visited" />다녀옴</span>
          <span><i className="dot planned" />약속 있음</span>
          {me.role === 'foreigner' && <span><i className="dot wish" />가고 싶어요</span>}
          <span><i className="dot none" />아직</span>
        </div>
      </div>

      <h2 className="section">다음 탐험의 이유</h2>
      <div className="stack">
        {next.map((a) => {
          const n = matchesFor(data, a.id).length;
          return (
            <button key={a.id} className="card row-link" onClick={() => go(`/activity/${a.id}`)}>
              <span>
                <b>{a.title}</b>
                <small>
                  {n > 0
                    ? `${me.role === 'foreigner' ? '아직 만나지 못한 주민' : '함께 가고 싶어 하는 친구'} ${n}명이 기다려요`
                    : a.talkAbout[0] + ' 이야기를 나눌 수 있어요'}
                </small>
              </span>
              <span aria-hidden="true">→</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
