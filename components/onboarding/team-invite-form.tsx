"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface Props {
  onNext: (emails: string[]) => void;
  loading?: boolean;
}

export function TeamInviteForm({ onNext, loading }: Props) {
  const [emails, setEmails] = useState<string[]>([""]);

  function update(i: number, value: string) {
    setEmails((prev) => prev.map((e, idx) => (idx === i ? value : e)));
  }

  function addRow() {
    setEmails((prev) => [...prev, ""]);
  }

  function removeRow(i: number) {
    setEmails((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext(emails.map((e) => e.trim()).filter(Boolean));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <Label>Teammate emails</Label>
        {emails.map((email, i) => (
          <div key={i} className="flex gap-2">
            <Input
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => update(i, e.target.value)}
              autoFocus={i === 0}
            />
            {emails.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRow(i)}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addRow}
          className="gap-1"
        >
          <Plus className="size-4" /> Add another
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Setting up…" : "Complete setup"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={loading}
          onClick={() => onNext([])}
        >
          Skip for now
        </Button>
      </div>
    </form>
  );
}
