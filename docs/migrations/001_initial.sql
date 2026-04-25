create table children (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_sound_id text not null,
  created_at timestamptz default now()
);

create table progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  sound_id text not null,
  status text not null default 'locked' check (status in ('locked','unlocked','complete')),
  last_played_at timestamptz,
  mastery_score int default 0,
  unique(child_id, sound_id)
);

-- Row Level Security (enable after creating tables)
alter table children enable row level security;
alter table progress enable row level security;

-- Anonymous read/write for MVP (tighten post-launch)
create policy "anon all children" on children for all to anon using (true) with check (true);
create policy "anon all progress" on progress for all to anon using (true) with check (true);
