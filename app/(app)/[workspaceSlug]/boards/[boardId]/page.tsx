import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/boards";
import { getBoardData, getWorkspaceLabels, getWorkspaceMembers } from "@/lib/data/issues";
import { KanbanBoard } from "@/components/kanban/board";

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

  const [columns, labels, members] = await Promise.all([
    getBoardData(supabase, boardId),
    getWorkspaceLabels(supabase, workspace.id),
    getWorkspaceMembers(supabase, workspace.id),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6 h-full">
      <h1 className="text-xl font-semibold shrink-0">{board.name}</h1>
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          boardId={boardId}
          initialColumns={columns}
          labels={labels}
          members={members}
        />
      </div>
    </div>
  );
}
