import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/boards";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; boardId: string }>;
}) {
  const { workspaceSlug, boardId } = await params;
  const supabase = await createClient();

  const workspace = await getWorkspaceBySlug(supabase, workspaceSlug);
  if (!workspace) notFound();

  const { data: board } = await supabase
    .from("boards")
    .select("*")
    .eq("id", boardId)
    .eq("workspace_id", workspace.id)
    .single();

  if (!board) notFound();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold">{board.name}</h1>
      <p className="text-muted-foreground">Kanban board coming in M5.</p>
    </div>
  );
}
