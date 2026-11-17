-- 모여 MVP 스키마. Supabase SQL Editor에 통째로 붙여넣고 Run.
-- 활동(콘텐츠) 목록은 앱 코드(src/lib/content.ts)에 있고, 여기에는 사람과 약속만 저장한다.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('foreigner', 'local')),
  name text not null,
  -- 외국인(유학생)만
  nationality text,
  topik_level int check (topik_level between 1 and 6),
  gender text check (gender in ('female', 'male')),
  -- 한국인(주민)만
  neighborhood text,
  available text,
  bio text not null default '',
  created_at timestamptz not null default now()
);

-- 외국인에게는 "가고 싶은 활동", 주민에게는 "함께해 줄 수 있는 활동"
create table if not exists public.interests (
  user_id uuid not null references public.profiles on delete cascade,
  activity_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, activity_id)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  activity_id text not null,
  foreigner_id uuid not null references public.profiles on delete cascade,
  local_id uuid not null references public.profiles on delete cascade,
  requested_by uuid not null references public.profiles on delete cascade,
  date date not null,
  time text not null,
  message text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'cancelled', 'done')),
  cards text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_foreigner_idx on public.bookings (foreigner_id);
create index if not exists bookings_local_idx on public.bookings (local_id);

alter table public.profiles enable row level security;
alter table public.interests enable row level security;
alter table public.bookings enable row level security;

-- 프로필과 관심 활동은 로그인한 사람끼리 서로 볼 수 있어야 매칭이 된다
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated using (true);
drop policy if exists "profiles write own" on public.profiles;
create policy "profiles write own" on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid());

drop policy if exists "interests read" on public.interests;
create policy "interests read" on public.interests for select to authenticated using (true);
drop policy if exists "interests insert own" on public.interests;
create policy "interests insert own" on public.interests for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "interests delete own" on public.interests;
create policy "interests delete own" on public.interests for delete to authenticated using (user_id = auth.uid());

-- 약속은 당사자 둘만 본다. 만들 때는 외국인-주민 짝이 맞아야 한다.
drop policy if exists "bookings read" on public.bookings;
create policy "bookings read" on public.bookings for select to authenticated
  using (auth.uid() in (foreigner_id, local_id));
drop policy if exists "bookings insert" on public.bookings;
create policy "bookings insert" on public.bookings for insert to authenticated
  with check (
    requested_by = auth.uid()
    and auth.uid() in (foreigner_id, local_id)
    and exists (select 1 from public.profiles p where p.id = foreigner_id and p.role = 'foreigner')
    and exists (select 1 from public.profiles p where p.id = local_id and p.role = 'local')
  );
drop policy if exists "bookings update" on public.bookings;
create policy "bookings update" on public.bookings for update to authenticated
  using (auth.uid() in (foreigner_id, local_id));

-- 2026-10-29 성별 추가. 이미 표를 만든 프로젝트는 이 줄만 실행해도 된다.
alter table public.profiles add column if not exists gender text check (gender in ('female', 'male'));

-- 2026-11-04 사전 등록 첫 로그인에서 받는 출생년도.
alter table public.profiles add column if not exists birth_year int check (birth_year between 1900 and 2100);
