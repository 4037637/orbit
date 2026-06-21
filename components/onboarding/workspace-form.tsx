"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface Props {
  onNext: (data: { name: string; slug: string }) => void;
}

export function WorkspaceForm({ onNext }: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(name));
  }, [name, slugEdited]);

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true);
    setSlug(slugify(e.target.value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({ name: name.trim(), slug });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="ws-name">Workspace name</Label>
        <Input
          id="ws-name"
          placeholder="Acme Inc."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ws-slug">URL slug</Label>
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-sm text-muted-foreground">orbit.app/</span>
          <Input
            id="ws-slug"
            placeholder="acme-inc"
            value={slug}
            onChange={handleSlugChange}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={!name.trim() || !slug}>
        Continue
      </Button>
    </form>
  );
}
