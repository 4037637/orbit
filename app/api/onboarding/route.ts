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

  // Create workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({ name: workspaceName.trim(), slug: slug.trim(), owner_id: user.id })
    .select()
    .single();

  if (workspaceError) {
    const message =
      workspaceError.code === "23505"
        ? "That workspace URL is already taken. Please choose another."
        : workspaceError.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Add owner as workspace member
  await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "owner",
    joined_at: new Date().toISOString(),
  });

  // Mark onboarding complete
  await supabase
    .from("profiles")
    .update({ onboarding_complete: true })
    .eq("id", user.id);

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

  return NextResponse.json({ slug: workspace.slug });
}
