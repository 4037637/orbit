import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug, getBoards } from "@/lib/data/boards";
import { BoardCard } from "@/components/app/board-card";
import { CreateBoardDialog } from "@/components/app/create-board-dialog";
import { Button } from "@/components/ui/button";

export default async function BoardsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const supabase = await createClient();
  const workspace = await getWorkspaceBySlug(supabase, workspaceSlug);
  if (!workspace) notFound();

  const boards = await getBoards(supabase, workspace.id);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{workspace.name}</h1>
        <CreateBoardDialog workspaceSlug={workspaceSlug} />
      </div>

      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-muted-foreground">No boards yet.</p>
          <CreateBoardDialog
            workspaceSlug={workspaceSlug}
            trigger={
              <Button variant="outline">Create your first board</Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              workspaceSlug={workspaceSlug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
