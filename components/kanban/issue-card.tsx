"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import type { IssueWithLabels } from "@/lib/data/issues";

const PRIORITY_COLORS: Record<IssueWithLabels["priority"], string> = {
  none: "bg-muted text-muted-foreground",
  low: "bg-blue-500/20 text-blue-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-red-500/20 text-red-400",
};

interface Props {
  issue: IssueWithLabels;
  onClick: (issue: IssueWithLabels) => void;
}

export function IssueCard({ issue, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: issue.id, data: { type: "issue", issue } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(issue)}
      className="cursor-pointer rounded-md border bg-card p-3 shadow-sm hover:border-ring/50 select-none"
    >
      <p className="text-sm leading-snug">{issue.title}</p>

      {(issue.labels.length > 0 || issue.priority !== "none") && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {issue.labels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: label.color + "33", color: label.color }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              {label.name}
            </span>
          ))}
          {issue.priority !== "none" && (
            <Badge
              className={`text-xs capitalize ${PRIORITY_COLORS[issue.priority]}`}
              variant="outline"
            >
              {issue.priority}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
