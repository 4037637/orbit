-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ─── TABLE DEFINITIONS ────────────────────────────────────────────────────────
-- All tables created before any policies so cross-table references work.

create table if not exists public.profiles (
  id                  uuid primary key references auth.users on delete cascade,
  email               text not null,
  full_name           text,
  avatar_url          text,
  onboarding_complete boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.workspaces (
  id                      uuid primary key default uuid_generate_v4(),
  name                    text not null,
  slug                    text not null unique,
  owner_id                uuid not null references public.profiles on delete restrict,
  plan                    text not null default 'lite' check (plan in ('lite', 'pro')),
  stripe_customer_id      text,
  stripe_subscription_id  text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references public.workspaces on delete cascade,
  user_id       uuid not null references public.profiles on delete cascade,
  role          text not null default 'member' check (role in ('owner', 'member')),
  joined_at     timestamptz,
  created_at    timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.boards (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references public.workspaces on delete cascade,
  name          text not null,
  description   text,
  position      float not null default 0,
  created_by    uuid not null references public.profiles on delete restrict,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.columns (
  id          uuid primary key default uuid_generate_v4(),
  board_id    uuid not null references public.boards on delete cascade,
  name        text not null,
  position    float not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create type public.issue_priority as enum ('none', 'low', 'medium', 'high', 'urgent');

create table if not exists public.issues (
  id           uuid primary key default uuid_generate_v4(),
  column_id    uuid not null references public.columns on delete cascade,
  board_id     uuid not null references public.boards on delete cascade,
  title        text not null,
  description  text,
  position     float not null default 0,
  priority     public.issue_priority not null default 'none',
  assignee_id  uuid references public.profiles on delete set null,
  created_by   uuid not null references public.profiles on delete restrict,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── ENABLE RLS ───────────────────────────────────────────────────────────────

alter table public.profiles          enable row level security;
alter table public.workspaces        enable row level security;
alter table public.workspace_members enable row level security;
alter table public.boards            enable row level security;
alter table public.columns           enable row level security;
alter table public.issues            enable row level security;

-- ─── POLICIES: profiles ───────────────────────────────────────────────────────

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ─── POLICIES: workspaces ─────────────────────────────────────────────────────

create policy "Members can view workspace"
  on public.workspaces for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspaces.id and wm.user_id = auth.uid()
    )
  );

create policy "Owner can update workspace"
  on public.workspaces for update
  using (owner_id = auth.uid());

create policy "Authenticated users can create workspaces"
  on public.workspaces for insert
  with check (auth.uid() = owner_id);

-- ─── POLICIES: workspace_members ──────────────────────────────────────────────

create policy "Members can view workspace members"
  on public.workspace_members for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id and wm.user_id = auth.uid()
    )
  );

create policy "Owner can manage members"
  on public.workspace_members for all
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role = 'owner'
    )
  );

create policy "Members can insert themselves (invite acceptance)"
  on public.workspace_members for insert
  with check (user_id = auth.uid());

-- ─── POLICIES: boards ─────────────────────────────────────────────────────────

create policy "Members can view boards"
  on public.boards for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = boards.workspace_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can create boards"
  on public.boards for insert
  with check (
    auth.uid() = created_by and
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = boards.workspace_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can update boards"
  on public.boards for update
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = boards.workspace_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can delete boards"
  on public.boards for delete
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = boards.workspace_id and wm.user_id = auth.uid()
    )
  );

-- ─── POLICIES: columns ────────────────────────────────────────────────────────

create policy "Members can view columns"
  on public.columns for select
  using (
    exists (
      select 1 from public.boards b
      join public.workspace_members wm on wm.workspace_id = b.workspace_id
      where b.id = columns.board_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can manage columns"
  on public.columns for all
  using (
    exists (
      select 1 from public.boards b
      join public.workspace_members wm on wm.workspace_id = b.workspace_id
      where b.id = columns.board_id and wm.user_id = auth.uid()
    )
  );

-- ─── POLICIES: issues ─────────────────────────────────────────────────────────

create policy "Members can view issues"
  on public.issues for select
  using (
    exists (
      select 1 from public.boards b
      join public.workspace_members wm on wm.workspace_id = b.workspace_id
      where b.id = issues.board_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can create issues"
  on public.issues for insert
  with check (
    auth.uid() = created_by and
    exists (
      select 1 from public.boards b
      join public.workspace_members wm on wm.workspace_id = b.workspace_id
      where b.id = issues.board_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can update issues"
  on public.issues for update
  using (
    exists (
      select 1 from public.boards b
      join public.workspace_members wm on wm.workspace_id = b.workspace_id
      where b.id = issues.board_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can delete issues"
  on public.issues for delete
  using (
    exists (
      select 1 from public.boards b
      join public.workspace_members wm on wm.workspace_id = b.workspace_id
      where b.id = issues.board_id and wm.user_id = auth.uid()
    )
  );

-- ─── FUNCTIONS & TRIGGERS ─────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.workspaces
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.boards
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.columns
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.issues
  for each row execute procedure public.set_updated_at();
