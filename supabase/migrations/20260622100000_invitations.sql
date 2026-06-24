create extension if not exists "pgcrypto";

create table public.workspace_invitations (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  email        text not null,
  invited_by   uuid not null references public.profiles(id),
  token        text not null unique default encode(extensions.gen_random_bytes(32), 'hex'),
  accepted_at  timestamptz,
  expires_at   timestamptz not null default now() + interval '7 days',
  created_at   timestamptz not null default now()
);

alter table public.workspace_invitations enable row level security;

create policy "Members can view invitations"
  on public.workspace_invitations for select
  using (exists (
    select 1 from public.workspace_members
    where workspace_id = workspace_invitations.workspace_id
      and user_id = auth.uid()
  ));

create policy "Owners can create invitations"
  on public.workspace_invitations for insert
  with check (exists (
    select 1 from public.workspace_members
    where workspace_id = workspace_invitations.workspace_id
      and user_id = auth.uid()
      and role = 'owner'
  ));

-- authenticated role: RLS policies gate actual row access
grant select, insert, update, delete on public.workspace_invitations to authenticated;

-- service_role bypasses RLS but still needs table-level PostgreSQL grants
grant all on public.workspace_invitations to service_role;
