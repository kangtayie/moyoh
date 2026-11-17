# 모여 (MVP)

한국어를 배우는 외국인(유학생)에게 서울·경기·인천(수도권)의 로컬 콘텐츠를 추천하고, 그곳을 함께 경험할 한국인 주민과 연결하는 서비스.

## 사용자 흐름 (FigJam "방문 전" 기준)

| 단계 | 외국인 | 한국인 주민 |
| --- | --- | --- |
| 가입 | 이메일 가입 → "외국인" 선택 | 이메일 가입 → "주민" 선택 |
| 01 수준 입력 | TOPIK 1~6급, 국적 | 사는 동네, 시간 되는 때, 함께할 수 있는 활동 |
| 02 가고 싶은 곳 | 급수에 맞춘 추천 + 추천 이유, ‘가고 싶어요’ | 내 활동을 원하는 외국인 목록 |
| 03 만나고 싶은 사람 | 활동 소개 + 동행 가능한 주민 | 활동 소개 + 가고 싶어 하는 외국인 |
| 04 만남 약속 | 주민에게 동행 예약 요청 | 외국인에게 먼저 제안, 받은 요청 수락/거절 |
| 05 말할 준비 | 급수에 맞게 자동 제안된 대화 카드 저장 → 당일 열어보기 | 상대의 급수와 저장한 카드를 보고 준비 |
| 재방문 | ‘다녀왔어요’ → 내 지도에 쌓이고, 남은 장소·사람이 다음 탐험 이유로 | 같음 |

매칭 규칙: **반대 역할**이면서 **같은 활동**에 관심을 표시한 사람끼리 보인다. 약속은 외국인 1명과 주민 1명 사이에서만 만들어진다(DB 규칙으로도 막음).

## 실행

```bash
npm install
npm run dev
```

http://localhost:5174 에서 열린다. `.env.local`이 없으면 **체험 모드**: 데이터가 이 브라우저에만 저장되고, 샘플 주민 3명·유학생 2명이 미리 들어 있다.
계정을 두 개(외국인·주민) 만들어 번갈아 로그인하면 요청 → 수락 → 대화 카드까지 혼자 시험해 볼 수 있다.

## 실제 서비스로 (Supabase)

1. Supabase에서 새 프로젝트를 만들고 SQL Editor에서 `supabase/schema.sql`을 실행한다.
2. Authentication → Sign In / Providers → Email을 켠다. (빠른 시험이면 "Confirm email"을 끈다)
3. Project Settings → API의 URL과 `anon public` 키를 `.env.local`에 넣는다.

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

이렇게 하면 서로 다른 기기의 실제 사용자끼리 매칭·예약된다. 상대의 수락은 창으로 돌아올 때와 30초마다 다시 읽어 반영한다.

## 구조

- `src/lib/content.ts` — 수도권 활동 12개(서울 7·경기 4·인천 1), 대화 카드, TOPIK 기반 추천 로직
- `src/lib/api.ts` — Supabase / 체험 모드(localStorage) 두 가지 백엔드
- `src/lib/store.ts` — 화면이 쓰는 데이터와 매칭 함수
- `src/pages/` — 가입, 프로필(01), 추천·친구 찾기(02), 활동(03), 예약(04·05), 지도(재방문)

## 설문 응답자 사전 등록

구글폼에 전화번호를 남긴 사람은 회원가입 없이 **아이디와 비밀번호 모두 전화번호**로 로그인하고, 첫 로그인에서 이름·출생년도·성별·국적·한 문장 소개를 입력한다.

1. Supabase SQL Editor에서 `supabase/schema.sql` 맨 아래의 `alter table` 두 줄(gender, birth_year)을 실행한다.
2. 구글 시트에서 파일 → 다운로드 → CSV로 받아 `private/`에 넣는다. 이 폴더는 git에 올라가지 않는다.
3. `.env.import`를 만든다. 이 파일도 git에 올라가지 않으며, `service_role` 키는 여기에만 둔다.

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

4. 미리보기로 인원을 확인한 뒤 `--apply`로 등록한다. 이미 있는 번호는 건너뛴다.

   ```bash
   node --env-file=.env.import scripts/import-contacts.mjs private/주민.csv private/유학생.csv
   node --env-file=.env.import scripts/import-contacts.mjs private/주민.csv private/유학생.csv --apply
   ```

설문 종류는 열 제목으로 구분한다. TOPIK 열이 있으면 유학생, 없으면 주민이다. 유학생은 TOPIK 급수, 주민은 거주 지역과 하고 싶은 활동을 설문 값에서 가져온다. 베타 테스트에 "아니오"라고 답한 사람과 휴대폰 번호가 아닌 응답은 제외한다.

## 커밋 메시지 규칙

`타입: 한 줄 요약` 형식으로 쓴다. 요약은 한국어로, 무엇이 바뀌었는지 적는다.

| 타입 | 쓰는 때 | 예시 |
| --- | --- | --- |
| `feat` | 사용자가 쓰는 기능 추가·변경 | `feat: 휴대폰 번호로 로그인` |
| `fix` | 버그 수정 | `fix: 약속 상세에서 없는 활동이면 안내 표시` |
| `docs` | README 등 문서만 수정 | `docs: 사전 등록 순서 추가` |
| `style` | 화면 동작은 그대로, 색·간격 등 꾸밈 | `style: 버튼 색을 로고색으로` |
| `refactor` | 동작은 그대로, 코드 구조 정리 | `refactor: 전화번호 규칙을 phone.ts로 분리` |
| `chore` | 설정, 패키지, 빌드, 스크립트 | `chore: Vite 포트 5174로 고정` |
