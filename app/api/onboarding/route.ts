import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/resend";

export async function POST(request: Request) {
  const { workspaceName, slug, inviteEmails } = await request.json();

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

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Pre-generate the UUID so we can reference it without needing RETURNING.
  // INSERT...RETURNING on workspaces would fail RLS because the workspaces
  // SELECT policy requires the user to already be in workspace_members —
  // but the member row hasn't been inserted yet at that point.
  const workspaceId = crypto.randomUUID();
  const trimmedSlug = slug.trim();

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

  // Add owner as workspace member
  const { error: memberError } = await supabase.from("workspace_members").insert({
    workspace_id: workspaceId,
    user_id: user.id,
    role: "owner",
    joined_at: new Date().toISOString(),
  });

  if (memberError) {
    // Rollback: remove the workspace so the slug isn't orphaned
    await supabase.from("workspaces").delete().eq("id", workspaceId);
    return NextResponse.json({ error: memberError.message }, { status: 400 });
  }

  // Mark onboarding complete
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ onboarding_complete: true })
    .eq("id", user.id);

  if (profileError) {
    await supabase.from("workspaces").delete().eq("id", workspaceId);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  // Send welcome email
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  if (profile) {
    sendWelcomeEmail(profile.email, profile.full_name, workspaceName.trim()).catch(
      () => {}
    );
  }

  return NextResponse.json({ slug: trimmedSlug });
}
