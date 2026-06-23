import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getWorkspaceBySlug } from "@/lib/data/boards";
import { getPendingInvitations } from "@/lib/data/invitations";
import { sendInviteEmail } from "@/lib/email/resend";
import { canInviteMember, type Plan } from "@/lib/plans";

type Context = { params: Promise<{ workspaceSlug: string }> };

export async function GET(_request: Request, context: Context) {
  const { workspaceSlug } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getWorkspaceBySlug(supabase, workspaceSlug);
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only owners may enumerate pending invitations
  const { data: callerMember } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspace.id)
    .eq("user_id", user.id)
    .single();

  if (callerMember?.role !== "owner") {
    return NextResponse.json({ error: "Only owners can view invitations." }, { status: 403 });
  }

  const service = createServiceClient();
  const invitations = await getPendingInvitations(service, workspace.id);
  return NextResponse.json(invitations);
}

export async function POST(request: Request, context: Context) {
  const { workspaceSlug } = await context.params;
  const { email } = await request.json();

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getWorkspaceBySlug(supabase, workspaceSlug);
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify caller is owner
  const { data: callerMember } = await supabase
    .from("workspace_members")
    .select("role, profiles(full_name)")
    .eq("workspace_id", workspace.id)
    .eq("user_id", user.id)
    .single();

  if (callerMember?.role !== "owner") {
    return NextResponse.json({ error: "Only owners can invite members." }, { status: 403 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const service = createServiceClient();

  // Enforce member limit based on workspace owner's plan.
  // Count both accepted members AND pending invitations so over-inviting is prevented.
  const [ownerProfileResult, currentMembersResult, pendingInvitesResult] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", workspace.owner_id).single(),
    service.from("workspace_members").select("role").eq("workspace_id", workspace.id),
    service
      .from("workspace_invitations")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspace.id)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString()),
  ]);
  const ownerPlan = (ownerProfileResult.data?.plan ?? "free") as Plan;
  const nonOwnerCount = (currentMembersResult.data ?? []).filter((m) => m.role !== "owner").length;
  const pendingCount = pendingInvitesResult.count ?? 0;
  if (!canInviteMember(ownerPlan, nonOwnerCount + pendingCount)) {
    return NextResponse.json({ error: "MEMBER_LIMIT_REACHED" }, { status: 403 });
  }

  // Run independent checks in parallel
  const [allMembersResult, existingInviteResult] = await Promise.all([
    service
      .from("workspace_members")
      .select("profiles(email)")
      .eq("workspace_id", workspace.id),
    service
      .from("workspace_invitations")
      .select("id")
      .eq("workspace_id", workspace.id)
      .eq("email", normalizedEmail)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle(),
  ]);

  const memberEmails = (allMembersResult.data ?? []).map(
    (m) => (m.profiles as { email: string } | null)?.email?.toLowerCase()
  );
  if (memberEmails.includes(normalizedEmail)) {
    return NextResponse.json({ error: "This person is already a member." }, { status: 409 });
  }

  if (existingInviteResult.data) {
    return NextResponse.json({ error: "An invite has already been sent to this email." }, { status: 409 });
  }

  // callerMember already has the profile name from the owner check above
  const callerName = (callerMember.profiles as { full_name: string | null } | null)?.full_name ?? null;

  // Create invitation
  const { data: invitation, error: inviteError } = await service
    .from("workspace_invitations")
    .insert({
      workspace_id: workspace.id,
      email: normalizedEmail,
      invited_by: user.id,
    })
    .select("token")
    .single();

  if (inviteError || !invitation) {
    return NextResponse.json({ error: inviteError?.message ?? "Failed to create invite." }, { status: 500 });
  }

  sendInviteEmail(normalizedEmail, callerName, workspace.name, invitation.token).catch(() => {});

  return NextResponse.json({ ok: true }, { status: 201 });
}
