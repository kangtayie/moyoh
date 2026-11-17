import { useEffect, useState } from 'react';

/** #/activity/abc → ['activity', 'abc'] */
export function useRoute(): string[] {
  const read = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function go(path: string) {
  location.hash = path;
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const w = '일월화수목금토'[new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${w})`;
}
