"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IssueCard } from "./issue-card";
import { KanbanColumn } from "./column";
import { IssueDetailSheet } from "./issue-detail-sheet";
import { CreateIssueDialog } from "./create-issue-dialog";
import type { ColumnWithIssues, IssueWithLabels, Label, Member } from "@/lib/data/issues";

interface Props {
  boardId: string;
  initialColumns: ColumnWithIssues[];
  labels: Label[];
  members: Member[];
}

export function KanbanBoard({ boardId, initialColumns, labels, members }: Props) {
  const [columns, setColumns] = useState<ColumnWithIssues[]>(initialColumns);
  const [activeIssue, setActiveIssue] = useState<IssueWithLabels | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<IssueWithLabels | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newIssueOpen, setNewIssueOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function findColumnOfIssue(issueId: string) {
    return columns.find((col) => col.issues.some((i) => i.id === issueId)) ?? null;
  }

  function handleDragStart({ active }: DragStartEvent) {
    const col = findColumnOfIssue(String(active.id));
    const issue = col?.issues.find((i) => i.id === String(active.id));
    setActiveIssue(issue ?? null);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceCol = findColumnOfIssue(activeId);
    if (!sourceCol) return;

    const destCol =
      columns.find((c) => c.id === overId) ?? findColumnOfIssue(overId);
    if (!destCol || sourceCol.id === destCol.id) return;

    setColumns((cols) => {
      const srcIssues = sourceCol.issues.filter((i) => i.id !== activeId);
      const issue = sourceCol.issues.find((i) => i.id === activeId)!;
      const overIdx = destCol.issues.findIndex((i) => i.id === overId);
      const insertAt = overIdx >= 0 ? overIdx : destCol.issues.length;
      const destIssues = [...destCol.issues];
      destIssues.splice(insertAt, 0, { ...issue, column_id: destCol.id });

      return cols.map((c) => {
        if (c.id === sourceCol.id) return { ...c, issues: srcIssues };
        if (c.id === destCol.id) return { ...c, issues: destIssues };
        return c;
      });
    });
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveIssue(null);
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const destCol =
      columns.find((c) => c.id === overId) ?? findColumnOfIssue(overId);
    if (!destCol) return;

    setColumns((cols) => {
      const col = cols.find((c) => c.id === destCol.id)!;
      const oldIdx = col.issues.findIndex((i) => i.id === activeId);
      const newIdx = col.issues.findIndex((i) => i.id === overId);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return cols;
      const reordered = arrayMove(col.issues, oldIdx, newIdx);
      return cols.map((c) => (c.id === destCol.id ? { ...c, issues: reordered } : c));
    });

    const col = columns.find((c) => c.id === destCol.id)!;
    const idx = col.issues.findIndex((i) => i.id === activeId);
    const prev = col.issues[idx - 1]?.position ?? 0;
    const next = col.issues[idx + 1]?.position ?? prev + 2;
    const newPosition = (prev + next) / 2;

    await fetch(`/api/issues/${activeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ column_id: destCol.id, position: newPosition }),
    });
  }

  const handleIssueCreated = useCallback((issue: IssueWithLabels) => {
    setColumns((cols) =>
      cols.map((c) =>
        c.id === issue.column_id ? { ...c, issues: [...c.issues, issue] } : c
      )
    );
  }, []);

  const handleIssueUpdated = useCallback((updated: IssueWithLabels) => {
    setColumns((cols) =>
      cols.map((c) => ({
        ...c,
        issues: c.issues.map((i) => (i.id === updated.id ? updated : i)),
      }))
    );
  }, []);

  const handleIssueDeleted = useCallback((issueId: string) => {
    setColumns((cols) =>
      cols.map((c) => ({ ...c, issues: c.issues.filter((i) => i.id !== issueId) }))
    );
  }, []);

  function openDetail(issue: IssueWithLabels) {
    setSelectedIssue(issue);
    setDetailOpen(true);
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-end shrink-0">
        <Button size="sm" onClick={() => setNewIssueOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Issue
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              boardId={boardId}
              labels={labels}
              onIssueCreated={handleIssueCreated}
              onIssueClick={openDetail}
            />
          ))}
        </div>
        <DragOverlay>
          {activeIssue && <IssueCard issue={activeIssue} onClick={() => {}} />}
        </DragOverlay>
      </DndContext>

      <CreateIssueDialog
        open={newIssueOpen}
        onClose={() => setNewIssueOpen(false)}
        boardId={boardId}
        columns={columns.map((c) => ({ id: c.id, name: c.name }))}
        labels={labels}
        onCreated={handleIssueCreated}
      />

      <IssueDetailSheet
        issue={selectedIssue}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdated={handleIssueUpdated}
        onDeleted={handleIssueDeleted}
        labels={labels}
        members={members}
      />
    </>
  );
}
