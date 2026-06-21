-- Replace self-referential workspace_members policies with security definer helpers.
-- The original policies queried workspace_members from within a workspace_members policy,
-- causing PostgreSQL to detect infinite recursion. Security definer functions bypass RLS
-- on the inner query, breaking the cycle.

create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_owner(p_workspace_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id and user_id = auth.uid() and role = 'owner'
  );
$$;

-- Drop the recursive policies on workspace_members
drop policy if exists "Members can view workspace members" on public.workspace_members;
drop policy if exists "Owner can manage members" on public.workspace_members;

-- Recreate using the non-recursive helpers
create policy "Members can view workspace members"
  on public.workspace_members for select
  using (is_workspace_member(workspace_id));

create policy "Owner can manage members"
  on public.workspace_members for all
  using (is_workspace_owner(workspace_id));
