"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, MoreHorizontal, Crown, Trash2, ArrowUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Member } from "@/lib/data/issues";

interface Invitation {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
}

interface Props {
  members: Member[];
  invitations: Invitation[];
  isOwner: boolean;
  currentUserId: string;
  workspaceSlug: string;
}

function initials(name: string | null, email: string) {
  return (name ?? email)
    .split(/[\s@]/)
    .filter(Boolean)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function MembersSection({ members, invitations, isOwner, currentUserId, workspaceSlug }: Props) {
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceSlug}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to send invite.");
      } else {
        toast.success(`Invite sent to ${inviteEmail.trim()}`);
        setInviteEmail("");
        setShowInviteForm(false);
        router.refresh();
      }
    } finally {
      setInviting(false);
    }
  }

  async function removeMember(userId: string, name: string | null, email: string) {
    if (!confirm(`Remove ${name ?? email} from this workspace?`)) return;
    const res = await fetch(`/api/workspaces/${workspaceSlug}/members/${userId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to remove member.");
    } else {
      toast.success(`${name ?? email} removed.`);
      router.refresh();
    }
  }

  async function changeRole(userId: string, newRole: "owner" | "member") {
    const res = await fetch(`/api/workspaces/${workspaceSlug}/members/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to update role.");
    } else {
      toast.success("Role updated.");
      router.refresh();
    }
  }

  async function revokeInvite(inviteId: string, email: string) {
    if (!confirm(`Revoke invite for ${email}?`)) return;
    const res = await fetch(`/api/workspaces/${workspaceSlug}/invitations/${inviteId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Failed to revoke invite.");
    } else {
      toast.success("Invite revoked.");
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      {/* Current members */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">Members</h2>
            <p className="text-sm text-muted-foreground">{members.length} {members.length === 1 ? "member" : "members"}</p>
          </div>
          {isOwner && (
            <Button size="sm" variant="outline" onClick={() => setShowInviteForm((v) => !v)} className="gap-2">
              <UserPlus className="size-4" />
              Invite member
            </Button>
          )}
        </div>

        {showInviteForm && (
          <form onSubmit={handleInvite} className="flex gap-2 mb-4">
            <Input
              type="email"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              autoFocus
              required
            />
            <Button type="submit" size="sm" disabled={inviting}>
              {inviting ? "Sending…" : "Send invite"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => { setShowInviteForm(false); setInviteEmail(""); }}>
              Cancel
            </Button>
          </form>
        )}

        <div className="divide-y rounded-md border">
          {members.map((m) => (
            <div key={m.userId} className="flex items-center gap-3 px-4 py-3">
              <Avatar size="sm">
                <AvatarImage src={m.avatarUrl ?? undefined} />
                <AvatarFallback>{initials(m.fullName, m.email)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                {m.fullName && <p className="text-sm font-medium truncate">{m.fullName}</p>}
                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
              </div>
              <Badge variant={m.role === "owner" ? "default" : "secondary"} className="shrink-0">
                {m.role === "owner" && <Crown className="size-3 mr-1" />}
                {m.role}
              </Badge>
              {isOwner && m.userId !== currentUserId && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "shrink-0")}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => changeRole(m.userId, m.role === "owner" ? "member" : "owner")}
                      className="gap-2"
                    >
                      <ArrowUpDown className="size-4" />
                      {m.role === "owner" ? "Demote to member" : "Promote to owner"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => removeMember(m.userId, m.fullName, m.email)}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pending invitations */}
      {isOwner && invitations.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-4">Pending invitations</h2>
          <div className="divide-y rounded-md border">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Sent {new Date(inv.created_at).toLocaleDateString()} · Expires {new Date(inv.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">Pending</Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => revokeInvite(inv.id, inv.email)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
