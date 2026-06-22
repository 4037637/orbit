import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { acceptInvitation } from "@/lib/data/invitations";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ token: string }> };

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createClient();
  const service = createServiceClient();

  // Fetch invitation with workspace name for the unauthenticated UI
  const { data: invitation } = await service
    .from("workspace_invitations")
    .select("accepted_at, expires_at, workspaces(slug, name)")
    .eq("token", token)
    .single();

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Invalid invitation</CardTitle>
            <CardDescription>This invite link is not valid or has already been used.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" className={cn(buttonVariants(), "w-full")}>
              Go to dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.accepted_at || new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Invitation expired</CardTitle>
            <CardDescription>This invite has already been accepted or has expired.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" className={cn(buttonVariants(), "w-full")}>
              Go to dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const workspace = invitation.workspaces as { slug: string; name: string } | null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>You&apos;ve been invited!</CardTitle>
            <CardDescription>
              You&apos;ve been invited to join <strong>{workspace?.name}</strong> on Orbit. Sign in to accept.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href={`/login?next=/invite/${token}`} className={cn(buttonVariants(), "w-full")}>
              Sign in to accept
            </Link>
            <Link href={`/signup?next=/invite/${token}`} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
              Create an account
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is logged in — delegate to shared helper (handles already-member, stamps accepted_at, checks errors)
  const result = await acceptInvitation(service, token, user.id);
  redirect(`/${result.workspaceSlug ?? workspace?.slug}/boards`);
}
