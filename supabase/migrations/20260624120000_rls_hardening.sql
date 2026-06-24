-- ─── RLS HARDENING: Close security gaps across all tables ────────────────────
--
-- Tables covered: profiles, workspaces, workspace_members,
--                 workspace_invitations, subscriptions
-- boards / columns / issues / labels / issue_labels are already fully covered.

-- ─── 1. profiles: workspace co-member visibility ─────────────────────────────
--
-- The app reads other users' profiles via the server client for:
--   - Member lists in workspace settings
--   - Issue assignee display
--   - Invitation sender name in emails
--
-- A security-definer helper avoids RLS recursion when querying workspace_members
-- from inside the profiles policy.

create or replace function public.is_workspace_coworker(p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members wm1
    join public.workspace_members wm2 on wm1.workspace_id = wm2.workspace_id
    where wm1.user_id = auth.uid() and wm2.user_id = p_user_id
  );
$$;

grant execute on function public.is_workspace_coworker(uuid) to authenticated;

-- Existing "Users can view own profile" stays; this policy ORs with it.
create policy "Workspace co-members can view profiles"
  on public.profiles for select
  using (is_workspace_coworker(id));

-- ─── 2. workspaces: owner can delete ─────────────────────────────────────────

create policy "Owner can delete workspace"
  on public.workspaces for delete
  using (owner_id = auth.uid());

-- ─── 3. workspace_members: close self-join loophole ──────────────────────────
--
-- "Members can insert themselves" let any authenticated user join any workspace
-- without an invitation. Invitation acceptance runs under service_role so
-- this policy is not needed for any legitimate flow.

drop policy if exists "Members can insert themselves (invite acceptance)" on public.workspace_members;

-- Members can leave a workspace by deleting their own row.
-- Owner removal of other members is already covered by "Owner can manage members".
create policy "Member can leave workspace"
  on public.workspace_members for delete
  using (user_id = auth.uid());

-- ─── 4. workspace_invitations: invitee access and owner management ────────────
--
-- The acceptance flow SELECTs the invitation by token before the user is a
-- workspace member, so the existing "Members can view invitations" policy
-- would not match. Allow lookup by email so invitees can reach their invite.

create policy "Invitee can view own invitation"
  on public.workspace_invitations for select
  using (email = auth.email());

-- Owners can update invitations (e.g. extend expiry).
create policy "Owners can update invitations"
  on public.workspace_invitations for update
  using (is_workspace_owner(workspace_id));

-- Owners can revoke (delete) pending invitations.
create policy "Owners can delete invitations"
  on public.workspace_invitations for delete
  using (is_workspace_owner(workspace_id));

-- ─── 5. subscriptions: writes are intentionally service_role only ─────────────
--
-- All INSERT / UPDATE / DELETE on subscriptions come from the Stripe webhook
-- route handler which uses the service_role client (bypasses RLS).
-- No authenticated write policy exists by design — RLS denies authenticated
-- mutations by default when no permissive policy matches.
