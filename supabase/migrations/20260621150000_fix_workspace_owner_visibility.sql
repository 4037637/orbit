-- Allow workspace owners to SELECT their own workspace immediately after creation,
-- before they've been added to workspace_members. Without this, any code that does
-- INSERT...RETURNING on workspaces fails RLS because the membership-based SELECT
-- policy finds no rows (the member hasn't been inserted yet).
create policy "Owner can view own workspace"
  on public.workspaces for select
  using (owner_id = auth.uid());
