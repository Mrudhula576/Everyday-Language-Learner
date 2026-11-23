-- Maatalu database schema (Supabase / Postgres)
--
-- How to apply: Supabase dashboard -> SQL Editor -> paste this file -> Run.
-- Safe to run more than once (it only creates what's missing).
--
-- Security model: the app uses the publishable (anon) key, so Row Level
-- Security (RLS) is what keeps data private.
--   * Each learner can read and write only their own rows.
--   * Lessons and lesson steps are read-only for everyone.
--   * Lesson content is written only from the dashboard / service role.
--
-- The old `scenarios` table is left untouched. Issue #8 turns scenarios into
-- lessons; drop it after that.


-- ---------------------------------------------------------------------------
-- Shared helper: keep updated_at current
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------------
-- profiles: one row per learner, created automatically on sign-up
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text not null
                check (username ~ '^[A-Za-z0-9_.]{3,30}$'),
  -- English accent being learned (keys of ENGLISH_VOICES in backend/voices.py)
  accent        text not null default 'en-US'
                check (accent in ('en-US', 'en-GB', 'en-AU', 'en-IN', 'en-IE', 'en-ZA', 'en-NG')),
  english_voice text,          -- null = the accent's default voice
  telugu_voice  text,          -- null = the default Telugu guide voice (Diya)
  text_mode     text not null default 'both'
                check (text_mode in ('both', 'en')),
  speech_speed  text not null default 'normal'
                check (speech_speed in ('slow', 'normal')),
  level         text            -- null until the level check is done
                check (level in ('beginner', 'elementary', 'intermediate', 'advanced')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Usernames are unique regardless of capitals ("Amma" and "amma" are the same).
create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username));

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create the profile when someone signs up. The sign-up page passes the
-- username as user metadata: supabase.auth.signUp({ ..., options: { data: { username } } })
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      -- Fallback (e.g. Google sign-in): a placeholder the user can change later.
      'user_' || substr(replace(new.id::text, '-', ''), 1, 12)
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only the trigger should run this; don't expose it through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- The sign-up page checks a username before submitting. Returns only
-- true/false, so it doesn't reveal anything else about other users.
create or replace function public.username_available(name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles where lower(username) = lower(name)
  );
$$;

revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;


-- ---------------------------------------------------------------------------
-- lessons and lesson_steps: shared content, read-only for learners
-- ---------------------------------------------------------------------------
create table if not exists public.lessons (
  id             bigint generated always as identity primary key,
  slug           text not null unique,             -- e.g. 'at-the-market'
  position       int  not null unique,             -- default order in the path
  title_en       text not null,
  title_te       text not null,
  description_en text,
  description_te text,
  emoji          text,
  level          text not null default 'beginner'
                 check (level in ('beginner', 'elementary', 'intermediate', 'advanced')),
  goals          text[] not null default '{}',     -- e.g. {market, doctor}: used to build plans
  published      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop trigger if exists lessons_set_updated_at on public.lessons;
create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

create table if not exists public.lesson_steps (
  id             bigint generated always as identity primary key,
  lesson_id      bigint not null references public.lessons (id) on delete cascade,
  position       int    not null,
  activity       text   not null
                 check (activity in ('repeat', 'order_words', 'pick_meaning', 'match', 'fill_blank')),
  explanation_te text   not null,                  -- what the Telugu guide says
  explanation_en text,
  phrase_en      text   not null,                  -- the English being taught
  meaning_te     text,                             -- Telugu meaning of the phrase
  choices        jsonb  not null default '[]',     -- wrong answers for games / pick-the-meaning
  created_at     timestamptz not null default now(),
  unique (lesson_id, position)
);


-- ---------------------------------------------------------------------------
-- Learner data: each row belongs to one user
-- ---------------------------------------------------------------------------

-- Level check answers (one row per attempt; retakes add a new row)
create table if not exists public.level_check_answers (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  answers    jsonb not null,                       -- raw answers, keyed by step
  goals      text[] not null default '{}',
  level      text not null
             check (level in ('beginner', 'elementary', 'intermediate', 'advanced')),
  created_at timestamptz not null default now()
);
create index if not exists level_check_answers_user_idx
  on public.level_check_answers (user_id, created_at desc);

-- The learner's plan and progress: one row per lesson in their plan
create table if not exists public.lesson_progress (
  user_id       uuid   not null default auth.uid() references auth.users (id) on delete cascade,
  lesson_id     bigint not null references public.lessons (id) on delete cascade,
  plan_position int    not null,                   -- order in this learner's path
  status        text   not null default 'locked'
                check (status in ('locked', 'available', 'in_progress', 'done')),
  current_step  int    not null default 0,
  best_accuracy numeric(5, 2) check (best_accuracy between 0 and 100),
  minutes_spent int    not null default 0 check (minutes_spent >= 0),
  completed_at  timestamptz,
  updated_at    timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

drop trigger if exists lesson_progress_set_updated_at on public.lesson_progress;
create trigger lesson_progress_set_updated_at
  before update on public.lesson_progress
  for each row execute function public.set_updated_at();

-- Every answer in a lesson (oral or reading)
create table if not exists public.attempts (
  id          bigint generated always as identity primary key,
  user_id     uuid   not null default auth.uid() references auth.users (id) on delete cascade,
  lesson_id   bigint not null references public.lessons (id) on delete cascade,
  step_id     bigint not null references public.lesson_steps (id) on delete cascade,
  mode        text   not null check (mode in ('oral', 'read')),
  correct     boolean not null,
  score       numeric(5, 2) check (score between 0 and 100),   -- pronunciation score (oral only)
  word_scores jsonb,                                         -- [{word, score, error}] (oral only)
  answer_text text,
  created_at  timestamptz not null default now()
);
create index if not exists attempts_user_idx on public.attempts (user_id, created_at desc);

-- Kite and Bridge game results
create table if not exists public.game_results (
  id               bigint generated always as identity primary key,
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  game             text not null check (game in ('kite', 'bridge')),
  lesson_id        bigint references public.lessons (id) on delete set null,  -- null = mixed review
  won              boolean not null,
  correct_count    int not null check (correct_count >= 0),
  total_count      int not null check (total_count >= 0),
  words_missed     text[] not null default '{}',
  duration_seconds int check (duration_seconds >= 0),
  created_at       timestamptz not null default now()
);
create index if not exists game_results_user_idx on public.game_results (user_id, created_at desc);


-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.lessons             enable row level security;
alter table public.lesson_steps        enable row level security;
alter table public.level_check_answers enable row level security;
alter table public.lesson_progress     enable row level security;
alter table public.attempts            enable row level security;
alter table public.game_results        enable row level security;

-- (select auth.uid()) is evaluated once per query instead of once per row.

-- profiles: read and edit only your own. Rows are created by the sign-up
-- trigger and removed when the account is deleted, so no insert/delete policy.
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- lessons + steps: anyone (even logged out, for the landing page) can read
-- published content. No write policies: only the dashboard/service role writes.
drop policy if exists "lessons: read published" on public.lessons;
create policy "lessons: read published" on public.lessons
  for select to anon, authenticated using (published);

drop policy if exists "lesson_steps: read published" on public.lesson_steps;
create policy "lesson_steps: read published" on public.lesson_steps
  for select to anon, authenticated
  using (exists (select 1 from public.lessons l where l.id = lesson_id and l.published));

-- level_check_answers: read + add your own (history is never edited)
drop policy if exists "level_check_answers: read own" on public.level_check_answers;
create policy "level_check_answers: read own" on public.level_check_answers
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "level_check_answers: add own" on public.level_check_answers;
create policy "level_check_answers: add own" on public.level_check_answers
  for insert to authenticated with check (user_id = (select auth.uid()));

-- lesson_progress: read, add and update your own; delete your own (e.g. new plan after a retake)
drop policy if exists "lesson_progress: read own" on public.lesson_progress;
create policy "lesson_progress: read own" on public.lesson_progress
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "lesson_progress: add own" on public.lesson_progress;
create policy "lesson_progress: add own" on public.lesson_progress
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "lesson_progress: update own" on public.lesson_progress;
create policy "lesson_progress: update own" on public.lesson_progress
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "lesson_progress: delete own" on public.lesson_progress;
create policy "lesson_progress: delete own" on public.lesson_progress
  for delete to authenticated using (user_id = (select auth.uid()));

-- attempts: read + add your own
drop policy if exists "attempts: read own" on public.attempts;
create policy "attempts: read own" on public.attempts
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "attempts: add own" on public.attempts;
create policy "attempts: add own" on public.attempts
  for insert to authenticated with check (user_id = (select auth.uid()));

-- game_results: read + add your own
drop policy if exists "game_results: read own" on public.game_results;
create policy "game_results: read own" on public.game_results
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "game_results: add own" on public.game_results;
create policy "game_results: add own" on public.game_results
  for insert to authenticated with check (user_id = (select auth.uid()));


-- Old prototype table (until issue #8 replaces it): keep it readable, but
-- make sure nobody can change it with the public key.
do $$
begin
  if to_regclass('public.scenarios') is not null then
    alter table public.scenarios enable row level security;
    drop policy if exists "scenarios: read" on public.scenarios;
    create policy "scenarios: read" on public.scenarios
      for select to anon, authenticated using (true);
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- Column protection: learners can change their settings and level, but never
-- the row's id or created_at.
-- ---------------------------------------------------------------------------
revoke update on public.profiles from anon, authenticated;
grant update (username, accent, english_voice, telugu_voice, text_mode, speech_speed, level)
  on public.profiles to authenticated;
