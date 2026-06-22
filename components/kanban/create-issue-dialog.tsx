"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { IssueWithLabels, Label as LabelType } from "@/lib/data/issues";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]),
  column_id: z.string().min(1),
  due_date: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  boardId: string;
  onCreated: (issue: IssueWithLabels) => void;
  columnId?: string;
  columns?: { id: string; name: string }[];
  labels: LabelType[];
}

export function CreateIssueDialog({
  open,
  onClose,
  boardId,
  onCreated,
  columnId,
  columns,
  labels,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const defaultColumnId = columnId ?? columns?.[0]?.id ?? "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "none", column_id: defaultColumnId },
  });

  const watchedColumnId = watch("column_id");
  const watchedPriority = watch("priority");
  const selectedColumnName =
    columns?.find((c) => c.id === watchedColumnId)?.name ?? null;

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      reset({ priority: "none", column_id: defaultColumnId });
      setSelectedLabelIds([]);
      onClose();
    }
  }

  function toggleLabel(id: string) {
    setSelectedLabelIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  }

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await fetch("/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        board_id: boardId,
        label_ids: selectedLabelIds,
      }),
    });
    setLoading(false);
    if (res.ok) {
      const issue = await res.json();
      const issueLabels = labels.filter((l) => selectedLabelIds.includes(l.id));
      onCreated({ ...issue, labels: issueLabels });
      reset({ priority: "none", column_id: defaultColumnId });
      setSelectedLabelIds([]);
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create issue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="ci-title">Title</Label>
            <Input id="ci-title" {...register("title")} autoFocus />
            {errors.title && (
              <p className="text-destructive text-xs">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="ci-desc">Description</Label>
            <Input id="ci-desc" {...register("description")} />
          </div>

          {columns && columns.length > 0 && (
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={watchedColumnId}
                onValueChange={(v) => setValue("column_id", v ?? defaultColumnId)}
              >
                <SelectTrigger>
                  <span className="flex-1 text-left text-sm">
                    {selectedColumnName ?? "Select status"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <Label>Priority</Label>
            <Select
              value={watchedPriority}
              onValueChange={(v) =>
                setValue("priority", (v ?? "none") as FormValues["priority"])
              }
            >
              <SelectTrigger>
                <span className="flex-1 text-left text-sm capitalize">
                  {watchedPriority ?? "none"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="ci-due">Due date</Label>
            <Input id="ci-due" type="date" {...register("due_date")} />
          </div>

          {labels.length > 0 && (
            <div className="space-y-2">
              <Label>Labels</Label>
              <div className="flex flex-wrap gap-1.5">
                {labels.map((label) => {
                  const active = selectedLabelIds.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-opacity"
                      style={{
                        backgroundColor: active ? label.color + "33" : "transparent",
                        color: label.color,
                        border: `1px solid ${label.color}`,
                        opacity: active ? 1 : 0.55,
                      }}
                    >
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      {label.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
