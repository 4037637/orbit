-- ─── RLS BUG FIXES ───────────────────────────────────────────────────────────

-- Bug 1 (Critical): "Member can leave workspace" allowed the workspace owner to
-- delete their own workspace_members row. workspaces.owner_id still pointed to
-- them, but nobody (including the former owner) could pass is_workspace_member()
-- anymore — the workspace became permanently inaccessible.
drop policy if exists "Member can leave workspace" on public.workspace_members;

create policy "Member can leave workspace"
  on public.workspace_members for delete
  using (user_id = auth.uid() AND NOT is_workspace_owner(workspace_id));

-- Bug 2 (Moderate): "Owner can manage members" had no explicit WITH CHECK.
-- Postgres defaults WITH CHECK to the USING expression, but for an UPDATE to the
-- owner's own row, whether is_workspace_owner() re-reads the modified role value
-- is implementation-defined. A direct PostgREST call could set role='member' on
-- the owner's own row, leaving the workspace with no owner and no way to recover.
-- Fix: explicit WITH CHECK that blocks self-demotion regardless of evaluation order.
drop policy if exists "Owner can manage members" on public.workspace_members;

create policy "Owner can manage members"
  on public.workspace_members for all
  using (is_workspace_owner(workspace_id))
  with check (
    is_workspace_owner(workspace_id)
    -- owner may not change their own role away from 'owner'
    AND (user_id != auth.uid() OR role = 'owner')
  );

-- Bug 3 (Minor): "Invitee can view own invitation" used case-sensitive equality.
-- Invitations are stored lowercase (app normalises with .toLowerCase()) but
-- auth.email() returns the raw signup value. "John@Example.com" != "john@example.com"
-- so the policy silently returned no rows for mixed-case auth emails.
drop policy if exists "Invitee can view own invitation" on public.workspace_invitations;

create policy "Invitee can view own invitation"
  on public.workspace_invitations for select
  using (lower(email) = lower(auth.email()));
