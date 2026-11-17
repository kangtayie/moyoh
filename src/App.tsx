import { api } from './lib/api';
import { go, useRoute } from './lib/router';
import { useAppData } from './lib/store';
import { ActivityPage } from './pages/ActivityPage';
import { AuthPage, Logo } from './pages/AuthPage';
import { BookingDetailPage, BookingsPage } from './pages/BookingsPage';
import { FirstProfilePage } from './pages/FirstProfilePage';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  const data = useAppData();
  const route = useRoute();

  if (!data.ready) return <div className="center-screen"><Logo height={48} /></div>;
  if (!data.userId) return <AuthPage />;
  if (!data.me) return data.meta.preregistered ? <FirstProfilePage data={data} /> : <ProfilePage data={data} onboarding />;

  const [page, id] = route;
  const pendingForMe = data.bookings.filter((b) => b.status === 'pending' && b.requested_by !== data.userId).length;
  const tabs = [
    { path: '', label: data.me.role === 'foreigner' ? '추천' : '친구 찾기' },
    { path: 'bookings', label: '약속', badge: pendingForMe },
    { path: 'map', label: '내 지도' },
    { path: 'me', label: '나' },
  ];
  const activeTab = page === 'booking' ? 'bookings' : page === 'activity' ? '' : (page ?? '');

  let body;
  if (page === 'activity' && id) body = <ActivityPage data={data} id={id} />;
  else if (page === 'bookings') body = <BookingsPage data={data} />;
  else if (page === 'booking' && id) body = <BookingDetailPage data={data} id={id} />;
  else if (page === 'map') body = <MapPage data={data} />;
  else if (page === 'me') body = <ProfilePage key={data.me.id} data={data} />;
  else body = <HomePage data={data} />;

  return (
    <div className={`app role-${data.me.role}`}>
      <header className="topbar">
        <button className="brand" onClick={() => go('/')}>
          <Logo height={26} />
        </button>
        <nav className="tabs">
          {tabs.map((t) => (
            <button key={t.path} className={activeTab === t.path ? 'on' : ''} onClick={() => go(`/${t.path}`)}>
              {t.label}
              {!!t.badge && <span className="badge">{t.badge}</span>}
            </button>
          ))}
        </nav>
        <span className="who">
          {data.me.name} · {data.me.role === 'foreigner' ? (data.me.topik_level ? `TOPIK ${data.me.topik_level}급` : '유학생') : '주민'}
          {api.localMode && <em>체험 모드</em>}
        </span>
      </header>
      <main>{body}</main>
    </div>
  );
}
