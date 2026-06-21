-- Grant table-level permissions to the authenticated role.
-- Required because auto_expose_new_tables is unset (new Supabase default = off),
-- so PostgREST does not expose tables to anon/authenticated without explicit GRANTs.
-- RLS policies still control which rows each user can access.

grant select, insert, update, delete on public.profiles          to authenticated;
grant select, insert, update, delete on public.workspaces        to authenticated;
grant select, insert, update, delete on public.workspace_members to authenticated;
grant select, insert, update, delete on public.boards            to authenticated;
grant select, insert, update, delete on public.columns           to authenticated;
grant select, insert, update, delete on public.issues            to authenticated;

grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.is_workspace_owner(uuid)  to authenticated;
