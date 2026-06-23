import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canCreateWorkspace, type Plan } from "@/lib/plans";

export async function POST(request: Request) {
  const { workspaceName, slug } = await request.json();

  if (!workspaceName?.trim() || !slug?.trim()) {
    return NextResponse.json(
      { error: "Workspace name and slug are required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profileResult, countResult] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", user.id).single(),
    supabase
      .from("workspaces")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id),
  ]);

  const plan = (profileResult.data?.plan ?? "free") as Plan;
  const ownedCount = countResult.count ?? 0;

  if (!canCreateWorkspace(plan, ownedCount)) {
    return NextResponse.json({ error: "WORKSPACE_LIMIT_REACHED" }, { status: 403 });
  }

  const workspaceId = crypto.randomUUID();
  const trimmedSlug = slug.trim().toLowerCase();

  const { error: workspaceError } = await supabase
    .from("workspaces")
    .insert({ id: workspaceId, name: workspaceName.trim(), slug: trimmedSlug, owner_id: user.id });

  if (workspaceError) {
    const message =
      workspaceError.code === "23505"
        ? "That workspace URL is already taken. Please choose another."
        : workspaceError.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { error: memberError } = await supabase.from("workspace_members").insert({
    workspace_id: workspaceId,
    user_id: user.id,
    role: "owner",
    joined_at: new Date().toISOString(),
  });

  if (memberError) {
    await supabase.from("workspaces").delete().eq("id", workspaceId);
    return NextResponse.json({ error: memberError.message }, { status: 400 });
  }

  return NextResponse.json({ slug: trimmedSlug }, { status: 201 });
}
