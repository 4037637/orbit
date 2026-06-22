import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getWorkspaceBySlug } from "@/lib/data/boards";

type Context = { params: Promise<{ workspaceSlug: string; inviteId: string }> };

export async function DELETE(_request: Request, context: Context) {
  const { workspaceSlug, inviteId } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getWorkspaceBySlug(supabase, workspaceSlug);
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: callerMember } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspace.id)
    .eq("user_id", user.id)
    .single();

  if (callerMember?.role !== "owner") {
    return NextResponse.json({ error: "Only owners can revoke invitations." }, { status: 403 });
  }

  const service = createServiceClient();
  const { error } = await service
    .from("workspace_invitations")
    .delete()
    .eq("id", inviteId)
    .eq("workspace_id", workspace.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
