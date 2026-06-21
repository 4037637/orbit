import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWorkspaces } from "@/lib/data/boards";

export default async function DashboardPage() {
  const supabase = await createClient();
  const workspaces = await getUserWorkspaces(supabase);
  if (workspaces.length === 0) {
    redirect("/onboarding");
  }
  redirect(`/${workspaces[0].slug}/boards`);
}
