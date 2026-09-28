create table if not exists public.candidate_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  vault jsonb not null default '[]'::jsonb,
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.candidate_progress enable row level security;

create policy "Candidates read own progress"
  on public.candidate_progress for select
  using (auth.uid() = user_id);

create policy "Candidates create own progress"
  on public.candidate_progress for insert
  with check (auth.uid() = user_id);

create policy "Candidates update own progress"
  on public.candidate_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.question_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null default '',
  question text not null,
  category text not null default 'Uncategorized',
  issue_type text not null,
  details text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.question_feedback enable row level security;

create policy "Candidates submit own question feedback"
  on public.question_feedback for insert
  with check (auth.uid() = user_id);

create policy "Candidates read own question feedback"
  on public.question_feedback for select
  using (auth.uid() = user_id);