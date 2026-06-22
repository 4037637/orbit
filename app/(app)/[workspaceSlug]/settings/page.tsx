import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getWorkspaceBySlug } from "@/lib/data/boards";
import { getWorkspaceMembers } from "@/lib/data/issues";
import { getPendingInvitations } from "@/lib/data/invitations";
import { MembersSection } from "@/components/settings/members-section";

type PageProps = { params: Promise<{ workspaceSlug: string }> };

export default async function SettingsPage({ params }: PageProps) {
  const { workspaceSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspaceBySlug(supabase, workspaceSlug);
  if (!workspace) redirect("/dashboard");

  const service = createServiceClient();
  const [members, invitations] = await Promise.all([
    getWorkspaceMembers(supabase, workspace.id),
    getPendingInvitations(service, workspace.id),
  ]);

  const currentMember = members.find((m) => m.userId === user.id);
  const isOwner = currentMember?.role === "owner";

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{workspace.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">Workspace settings</p>
      </div>

      <MembersSection
        members={members}
        invitations={invitations}
        isOwner={isOwner}
        currentUserId={user.id}
        workspaceSlug={workspaceSlug}
      />
    </div>
  );
}
