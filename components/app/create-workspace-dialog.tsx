"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLimitReached: () => void;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CreateWorkspaceDialog({ open, onOpenChange, onLimitReached }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setSlug(slugify(value));
  }

  function reset() {
    setName("");
    setSlug("");
    setSlugEdited(false);
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setError(null);
    setLoading(true);

    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceName: name.trim(), slug: slug.trim() }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (body.error === "WORKSPACE_LIMIT_REACHED") {
        handleOpenChange(false);
        onLimitReached();
        return;
      }
      setError(body.error ?? "Something went wrong.");
      return;
    }

    const { slug: newSlug } = await res.json();
    handleOpenChange(false);
    router.push(`/${newSlug}/boards`);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
        </DialogHeader>

        <form id="create-workspace-form" onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="ws-name">Workspace name</Label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Acme Corp"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws-slug">URL</Label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground shrink-0">orbit.app/</span>
              <Input
                id="ws-slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="acme-corp"
                required
              />
            </div>
          </div>
        </form>

        <DialogFooter showCloseButton>
          <Button
            type="submit"
            form="create-workspace-form"
            disabled={!name.trim() || !slug.trim() || loading}
          >
            {loading ? "Creating…" : "Create workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
