"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { IssueWithLabels, Label as LabelType, Member } from "@/lib/data/issues";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]),
  due_date: z.string().optional(),
  assignee_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  issue: IssueWithLabels | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (issue: IssueWithLabels) => void;
  onDeleted: (issueId: string) => void;
  labels: LabelType[];
  members: Member[];
}

export function IssueDetailSheet({
  issue,
  open,
  onClose,
  onUpdated,
  onDeleted,
  labels,
  members,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "none" },
  });

  useEffect(() => {
    if (issue) {
      reset({
        title: issue.title,
        description: issue.description ?? "",
        priority: issue.priority,
        due_date: issue.due_date ?? "",
        assignee_id: issue.assignee_id ?? "",
      });
      setSelectedLabelIds(issue.labels.map((l) => l.id));
      setConfirmDelete(false);
    }
  }, [issue, reset]);

  function toggleLabel(id: string) {
    setSelectedLabelIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  }

  async function onSubmit(values: FormValues) {
    if (!issue) return;
    setSaving(true);
    const res = await fetch(`/api/issues/${issue.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        assignee_id: values.assignee_id || null,
        due_date: values.due_date || null,
        label_ids: selectedLabelIds,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      const updatedLabels = labels.filter((l) => selectedLabelIds.includes(l.id));
      onUpdated({ ...updated, labels: updatedLabels });
      onClose();
    }
  }

  async function handleDelete() {
    if (!issue) return;
    setDeleting(true);
    await fetch(`/api/issues/${issue.id}`, { method: "DELETE" });
    setDeleting(false);
    onDeleted(issue.id);
    setConfirmDelete(false);
    onClose();
  }

  const priority = watch("priority");
  const assigneeId = watch("assignee_id");
  const selectedAssigneeName =
    members.find((m) => m.userId === assigneeId)?.fullName ||
    members.find((m) => m.userId === assigneeId)?.email ||
    null;

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="w-[440px] sm:max-w-[440px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Issue detail</SheetTitle>
          </SheetHeader>

          {issue && (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="is-title">Title</Label>
                <Input id="is-title" {...register("title")} />
                {errors.title && (
                  <p className="text-destructive text-xs">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="is-desc">Description</Label>
                <Textarea
                  id="is-desc"
                  {...register("description")}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label>Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(v) =>
                    setValue("priority", (v ?? "none") as FormValues["priority"])
                  }
                >
                  <SelectTrigger>
                    <span className="flex-1 text-left text-sm capitalize">
                      {priority ?? "none"}
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
                <Label htmlFor="is-due">Due date</Label>
                <Input id="is-due" type="date" {...register("due_date")} />
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

              {members.length > 0 && (
                <div className="space-y-1">
                  <Label>Assignee</Label>
                  <Select
                    value={assigneeId ?? ""}
                    onValueChange={(v) => setValue("assignee_id", v ?? "")}
                  >
                    <SelectTrigger>
                      <span className="flex-1 text-left text-sm">
                        {selectedAssigneeName ?? "Unassigned"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.userId} value={m.userId}>
                          {m.fullName ?? m.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete issue?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete &ldquo;{issue?.title}&rdquo;. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
