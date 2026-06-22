import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export type PendingInvitation = {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
};

export async function getPendingInvitations(
  service: Client,
  workspaceId: string
): Promise<PendingInvitation[]> {
  const { data } = await service
    .from("workspace_invitations")
    .select("id, email, created_at, expires_at")
    .eq("workspace_id", workspaceId)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  return (data ?? []) as PendingInvitation[];
}

export async function acceptInvitation(
  service: Client,
  token: string,
  userId: string
): Promise<{ workspaceSlug?: string; error?: string; status: number }> {
  const { data: invitation } = await service
    .from("workspace_invitations")
    .select("id, workspace_id, accepted_at, expires_at, workspaces(slug)")
    .eq("token", token)
    .single();

  if (!invitation) return { error: "Invitation not found.", status: 404 };
  if (invitation.accepted_at) return { error: "Invitation already accepted.", status: 409 };
  if (new Date(invitation.expires_at) < new Date()) return { error: "Invitation has expired.", status: 410 };

  const workspace = invitation.workspaces as { slug: string } | null;

  const { data: existing } = await service
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", invitation.workspace_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    // Already a member — still stamp accepted_at so the invite leaves the pending list
    await service
      .from("workspace_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);
    return { workspaceSlug: workspace?.slug, status: 200 };
  }

  const { error: memberError } = await service.from("workspace_members").insert({
    workspace_id: invitation.workspace_id,
    user_id: userId,
    role: "member",
    joined_at: new Date().toISOString(),
  });

  if (memberError) return { error: memberError.message, status: 500 };

  const { error: updateError } = await service
    .from("workspace_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  if (updateError) {
    console.error("Failed to stamp invitation accepted_at:", updateError.message);
  }

  return { workspaceSlug: workspace?.slug, status: 200 };
}
