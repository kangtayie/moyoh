import { useState } from 'react';
import { api, PREREGISTERED_SAMPLES, SAMPLE_PASSWORD } from '../lib/api';
import { phoneDigits, phoneToEmail } from '../lib/phone';
import { go } from '../lib/router';

const SAMPLES = [
  { id: 's-local-1', label: '김영숙 · 주민' },
  { id: 's-local-2', label: '이준호 · 주민' },
  { id: 's-for-1', label: 'Linh · 유학생' },
];

/** 아이디는 이메일 또는 휴대폰 번호 */
function toAuthEmail(id: string): string | null {
  const v = id.trim();
  if (v.includes('@')) return v.toLowerCase();
  const digits = phoneDigits(v);
  return digits && phoneToEmail(digits);
}

const AUTH_ERRORS: Record<string, string> = {
  'User already registered': '이미 가입한 아이디예요. 로그인해 주세요. 설문에 참여하셨다면 비밀번호도 전화번호예요.',
  'Invalid login credentials': '아이디 또는 비밀번호가 맞지 않아요.',
  'Password should be at least 6 characters.': '비밀번호는 6자 이상이어야 해요.',
};

export function AuthPage() {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const email = toAuthEmail(loginId);
    if (!email) {
      setError('이메일 주소나 휴대폰 번호(예: 010-1234-5678)를 입력해 주세요.');
      return;
    }
    setBusy(true);
    try {
      // 비밀번호가 전화번호 모양이면 010-1234-5678처럼 적어도 숫자만 남겨 맞춘다
      const pw = phoneDigits(password) ?? password;
      if (mode === 'signup') await api.signUp(email, pw);
      else await api.signIn(email, pw);
      go('/');
    } catch (err) {
      const msg = (err as Error).message;
      setError(AUTH_ERRORS[msg] ?? msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-hero">
        <h1><Logo height={72} /></h1>
        <p className="lead">한국의 깊은 곳을 발견하고,<br />그곳의 사람과 대화할 준비</p>
        <ul className="auth-points">
          <li><b>유학생</b>은 TOPIK 수준에 맞는 서울·경기의 장소와 함께 갈 주민을 찾고</li>
          <li><b>주민</b>은 우리 동네를 함께 걸을 외국인 친구를 만나요</li>
        </ul>
      </div>

      <form className="card auth-box" onSubmit={submit}>
        <div className="seg">
          <button type="button" className={mode === 'signup' ? 'on' : ''} onClick={() => setMode('signup')}>회원가입</button>
          <button type="button" className={mode === 'signin' ? 'on' : ''} onClick={() => setMode('signin')}>로그인</button>
        </div>
        <label className="field">
          <span>이메일 또는 휴대폰 번호</span>
          <input
            required
            autoComplete="username"
            autoCapitalize="off"
            placeholder="예시) moyoh@gmail.com 또는 010-1234-5678"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
          />
        </label>
        <label className="field">
          <span>비밀번호</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary full" disabled={busy}>
          {mode === 'signup' ? '가입하고 시작하기' : '로그인'}
        </button>
        <p className="hint">
          설문에 참여하셨나요? 가입은 이미 되어 있어요.{' '}
          <button type="button" className="link" onClick={() => setMode('signin')}>로그인</button>에서 아이디와 비밀번호 모두 전화번호를 입력해 주세요.
        </p>

        {api.localMode && (
          <div className="demo">
            <p className="hint">
              체험 모드예요. 데이터는 이 브라우저에만 저장돼요. 계정을 두 개(유학생·주민) 만들어 번갈아 로그인하면
              매칭과 예약 수락을 직접 해 볼 수 있어요.
            </p>
            <div className="chips">
              {SAMPLES.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  className="chip"
                  onClick={() => api.signIn(`${s.id}@sample.moyoh`, SAMPLE_PASSWORD).then(() => go('/'))}
                >
                  {s.label} 계정으로 둘러보기
                </button>
              ))}
              {PREREGISTERED_SAMPLES.map((s) => (
                <button
                  type="button"
                  key={s.phone}
                  className="chip"
                  onClick={() => api.signIn(phoneToEmail(s.phone), s.phone).then(() => go('/'))}
                >
                  {s.label} 첫 로그인
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

/** '모여' 워드마크. 원본: 모여로고.svg (1117×507), 색은 --brand */
export function Logo({ height = 40 }: { height?: number }) {
  return (
    <svg
      height={height}
      width={(height * 1117) / 507}
      viewBox="0 0 1117 507"
      fill="var(--brand)"
      fillRule="evenodd"
      clipRule="evenodd"
      role="img"
      aria-label="모여"
    >
      <path d="M67 20H479C486 20 491 24 491 32L490 278C490 285 486 289 478 289H165L93 340C90 343 86 341 86 337V275C63 275 43 260 43 237L55 32C55 25 59 20 67 20ZM175 124H364C369 124 371 126 371 131V216C371 221 369 223 364 223H175C170 223 168 221 168 216V131C168 126 170 124 175 124Z" />
      <path d="M9 395H203V320C203 315 206 312 211 312H316C321 312 324 315 324 320V395H538C543 395 546 398 546 403V498C546 503 543 506 538 506H9C4 506 1 503 1 498V403C1 398 4 395 9 395Z" />
      <path d="M722 37C826 37 895 116 895 220C895 328 815 408 705 408C600 408 524 331 524 232C524 122 606 37 722 37ZM714 151C753 151 780 180 780 220C780 262 749 293 708 293C669 293 642 265 642 227C642 185 672 151 714 151Z" />
      <path d="M989 13L1109 1C1114 0 1117 3 1117 8V498C1117 503 1114 506 1109 506H982C977 506 974 504 974 499L981 330L880 338C876 338 874 336 876 332C890 304 900 275 906 246L983 239L985 191L911 197C909 197 908 196 908 193C907 163 901 135 891 108C889 104 891 101 895 101L984 94L983 20C983 16 985 14 989 13Z" />
    </svg>
  );
}
