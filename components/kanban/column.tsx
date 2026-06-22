"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IssueCard } from "./issue-card";
import { CreateIssueDialog } from "./create-issue-dialog";
import type { ColumnWithIssues, IssueWithLabels, Label } from "@/lib/data/issues";

interface Props {
  column: ColumnWithIssues;
  boardId: string;
  labels: Label[];
  onIssueCreated: (issue: IssueWithLabels) => void;
  onIssueClick: (issue: IssueWithLabels) => void;
}

export function KanbanColumn({ column, boardId, labels, onIssueCreated, onIssueClick }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: "column", column } });

  return (
    <div className="flex w-72 shrink-0 flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-medium">
          {column.name}
          <span className="ml-2 text-muted-foreground text-xs">{column.issues.length}</span>
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-16 flex-col gap-2 rounded-lg p-2 transition-colors ${
          isOver ? "bg-accent/40" : "bg-muted/30"
        }`}
      >
        <SortableContext
          items={column.issues.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onClick={onIssueClick} />
          ))}
        </SortableContext>
      </div>

      <CreateIssueDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        columnId={column.id}
        boardId={boardId}
        labels={labels}
        onCreated={onIssueCreated}
      />
    </div>
  );
}
