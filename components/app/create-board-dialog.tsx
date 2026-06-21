"use client";

import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  workspaceSlug: string;
  trigger?: ReactNode;
}

export function CreateBoardDialog({ workspaceSlug, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/workspaces/${workspaceSlug}/boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong.");
      return;
    }

    setOpen(false);
    setName("");
    setDescription("");
    router.refresh();
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("");
      setDescription("");
      setError(null);
    }
    setOpen(next);
  }

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents">
        {trigger ?? (
          <Button size="sm">
            <Plus className="size-4" />
            New board
          </Button>
        )}
      </span>

      <Dialog open={open} onOpenChange={(next) => handleOpenChange(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create board</DialogTitle>
          </DialogHeader>

          <form id="create-board-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="board-name">Name</Label>
              <Input
                id="board-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Product Roadmap"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="board-description">
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="board-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this board for?"
              />
            </div>
          </form>

          <DialogFooter showCloseButton>
            <Button
              type="submit"
              form="create-board-form"
              disabled={!name.trim() || loading}
            >
              {loading ? "Creating…" : "Create board"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
