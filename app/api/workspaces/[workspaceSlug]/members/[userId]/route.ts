import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/boards";

type Context = { params: Promise<{ workspaceSlug: string; userId: string }> };

export async function DELETE(_request: Request, context: Context) {
  const { workspaceSlug, userId } = await context.params;
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
    return NextResponse.json({ error: "Only owners can remove members." }, { status: 403 });
  }

  if (userId === user.id) {
    return NextResponse.json({ error: "You cannot remove yourself." }, { status: 400 });
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, context: Context) {
  const { workspaceSlug, userId } = await context.params;
  const { role } = await request.json();

  if (role !== "owner" && role !== "member") {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

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
    return NextResponse.json({ error: "Only owners can change roles." }, { status: 403 });
  }

  // Prevent owner self-demotion — would leave the workspace ownerless
  if (userId === user.id && role === "member") {
    return NextResponse.json({ error: "You cannot demote yourself." }, { status: 400 });
  }

  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("workspace_id", workspace.id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
