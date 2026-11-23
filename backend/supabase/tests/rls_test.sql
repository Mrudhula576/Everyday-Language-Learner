-- Security test for schema.sql: two learners (A and B) and a logged-out visitor.
--
-- How to run: Supabase dashboard -> SQL Editor -> paste this file -> Run.
-- Everything happens inside one transaction that is rolled back at the end,
-- so no test users or rows are left behind.
-- Success: the last result says 'ALL RLS TESTS PASSED'. Any failure stops
-- the script with an error that names the check.

begin;

-- ---------------------------------------------------------------------------
-- Setup (as the database owner)
-- ---------------------------------------------------------------------------
insert into public.lessons (slug, position, title_en, title_te, published)
values ('test-published', 9001, 'Test lesson', 'పరీక్ష పాఠం', true),
       ('test-draft',     9002, 'Draft lesson', 'చిత్తు పాఠం', false);

insert into public.lesson_steps (lesson_id, position, activity, explanation_te, phrase_en)
select id, 1, 'repeat', 'ఇలా చెప్పండి', 'Hello' from public.lessons where slug in ('test-published', 'test-draft');

-- Signing up = a row in auth.users; the trigger creates the profile.
insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-4000-a000-00000000000a', 'learner-a@example.test', '{"username": "LearnerA"}'),
       ('00000000-0000-4000-a000-00000000000b', 'learner-b@example.test', '{"username": "learner_b"}'),
       ('00000000-0000-4000-a000-00000000000c', 'learner-c@example.test', '{}');

do $$
begin
  assert (select username from public.profiles where id = '00000000-0000-4000-a000-00000000000a') = 'LearnerA',
    'sign-up trigger should create a profile with the chosen username';
  assert (select accent from public.profiles where id = '00000000-0000-4000-a000-00000000000a') = 'en-US',
    'new profiles should default to US English';
  assert (select username from public.profiles where id = '00000000-0000-4000-a000-00000000000c') like 'user\_%',
    'sign-up without a username (e.g. Google) should get a placeholder username';

  begin
    insert into auth.users (id, email, raw_user_meta_data)
    values ('00000000-0000-4000-a000-0000000000dd', 'dupe@example.test', '{"username": "learnera"}');
    raise exception 'FAIL: a username differing only in capitals was accepted';
  exception when unique_violation then null;
  end;
end $$;

-- ---------------------------------------------------------------------------
-- Learner A
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-a000-00000000000a", "role": "authenticated"}', true);

do $$
declare
  lesson bigint := (select id from public.lessons where slug = 'test-published');
  step   bigint := (select id from public.lesson_steps where lesson_id = lesson);
  n      int;
begin
  -- Profiles
  assert (select count(*) from public.profiles) = 1, 'A should see only their own profile';
  update public.profiles set accent = 'en-GB', level = 'beginner' where id = auth.uid();
  assert (select accent from public.profiles) = 'en-GB', 'A should be able to change their accent';

  update public.profiles set accent = 'en-AU' where id = '00000000-0000-4000-a000-00000000000b';
  get diagnostics n = row_count;
  assert n = 0, 'A must not be able to change B''s profile';

  begin
    update public.profiles set id = '00000000-0000-4000-a000-00000000000b' where id = auth.uid();
    raise exception 'FAIL: A changed their profile id';
  exception when insufficient_privilege then null;
  end;

  -- Lessons
  assert (select count(*) from public.lessons where slug like 'test-%') = 1, 'A should see published lessons only';
  assert (select count(*) from public.lesson_steps where lesson_id = lesson) = 1, 'A should see steps of published lessons';
  begin
    insert into public.lessons (slug, position, title_en, title_te) values ('hack', 9999, 'x', 'x');
    raise exception 'FAIL: a learner created a lesson';
  exception when insufficient_privilege then null;
  end;

  -- Own learning data
  insert into public.level_check_answers (answers, goals, level) values ('{"q1": 2}', '{market}', 'beginner');
  insert into public.lesson_progress (lesson_id, plan_position, status) values (lesson, 1, 'available');
  update public.lesson_progress set status = 'done', best_accuracy = 90 where lesson_id = lesson;
  insert into public.attempts (lesson_id, step_id, mode, correct, score) values (lesson, step, 'oral', true, 86);
  insert into public.game_results (game, lesson_id, won, correct_count, total_count) values ('bridge', lesson, true, 8, 10);

  -- Writing rows for someone else must fail
  begin
    insert into public.attempts (user_id, lesson_id, step_id, mode, correct)
    values ('00000000-0000-4000-a000-00000000000b', lesson, step, 'read', true);
    raise exception 'FAIL: A saved an attempt as B';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.game_results (user_id, game, won, correct_count, total_count)
    values ('00000000-0000-4000-a000-00000000000b', 'kite', true, 10, 10);
    raise exception 'FAIL: A saved a game result as B';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;

-- ---------------------------------------------------------------------------
-- Learner B: must not see anything of A's
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-a000-00000000000b", "role": "authenticated"}', true);

do $$
declare
  n int;
begin
  assert (select count(*) from public.profiles) = 1, 'B should see only their own profile';
  assert (select username from public.profiles) = 'learner_b', 'B should see their own profile, not A''s';
  assert (select count(*) from public.level_check_answers) = 0, 'B must not see A''s level check';
  assert (select count(*) from public.lesson_progress) = 0, 'B must not see A''s progress';
  assert (select count(*) from public.attempts) = 0, 'B must not see A''s attempts';
  assert (select count(*) from public.game_results) = 0, 'B must not see A''s game results';

  update public.lesson_progress set status = 'locked';
  get diagnostics n = row_count;
  assert n = 0, 'B must not be able to change A''s progress';

  delete from public.lesson_progress;
  get diagnostics n = row_count;
  assert n = 0, 'B must not be able to delete A''s progress';
end $$;

reset role;

-- ---------------------------------------------------------------------------
-- Logged-out visitor (anon key, no login)
-- ---------------------------------------------------------------------------
set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);

do $$
declare
  n int;
begin
  assert (select count(*) from public.profiles) = 0, 'visitors must not see any profiles';
  assert (select count(*) from public.attempts) = 0, 'visitors must not see any attempts';
  assert (select count(*) from public.lessons where slug like 'test-%') = 1, 'visitors should see published lessons only';
  assert public.username_available('brand_new_name'), 'a free username should be available';
  assert not public.username_available('LEARNERA'), 'a taken username (any capitals) should not be available';

  begin
    insert into public.game_results (game, won, correct_count, total_count) values ('kite', true, 1, 1);
    raise exception 'FAIL: a visitor saved a game result';
  exception when insufficient_privilege or not_null_violation then null;
  end;

  -- Old prototype table: readable, but not changeable.
  if to_regclass('public.scenarios') is not null then
    execute 'delete from public.scenarios';
    get diagnostics n = row_count;
    assert n = 0, 'visitors must not be able to delete scenarios';
  end if;
end $$;

reset role;

select 'ALL RLS TESTS PASSED' as result;

rollback;
