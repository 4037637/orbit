import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWorkspaces } from "@/lib/data/boards";
import { Sidebar } from "@/components/app/sidebar";
import type { Plan } from "@/lib/plans";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [workspaces, profileResult] = await Promise.all([
    getUserWorkspaces(supabase),
    supabase
      .from("profiles")
      .select("full_name, avatar_url, email, plan")
      .eq("id", user.id)
      .single(),
  ]);

  const profile = profileResult.data ?? {
    full_name: null,
    avatar_url: null,
    email: user.email ?? "",
    plan: "free",
  };

  const ownedWorkspaceCount = workspaces.filter((w) => w.owner_id === user.id).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        workspaces={workspaces}
        user={profile}
        plan={(profile.plan ?? "free") as Plan}
        ownedWorkspaceCount={ownedWorkspaceCount}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
