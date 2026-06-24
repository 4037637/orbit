-- due_date on issues
alter table public.issues add column if not exists due_date date;

-- ─── labels ───────────────────────────────────────────────────────────────────

create table if not exists public.labels (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces on delete cascade,
  name          text not null,
  color         text not null default '#6366f1',
  created_at    timestamptz not null default now()
);

create table if not exists public.issue_labels (
  issue_id  uuid not null references public.issues on delete cascade,
  label_id  uuid not null references public.labels on delete cascade,
  primary key (issue_id, label_id)
);

alter table public.labels       enable row level security;
alter table public.issue_labels enable row level security;

create policy "Members can view labels"
  on public.labels for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = labels.workspace_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can manage labels"
  on public.labels for all
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = labels.workspace_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can view issue_labels"
  on public.issue_labels for select
  using (
    exists (
      select 1 from public.issues i
      join public.boards b on b.id = i.board_id
      join public.workspace_members wm on wm.workspace_id = b.workspace_id
      where i.id = issue_labels.issue_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can manage issue_labels"
  on public.issue_labels for all
  using (
    exists (
      select 1 from public.issues i
      join public.boards b on b.id = i.board_id
      join public.workspace_members wm on wm.workspace_id = b.workspace_id
      where i.id = issue_labels.issue_id and wm.user_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.labels       to authenticated;
grant select, insert, update, delete on public.issue_labels to authenticated;
