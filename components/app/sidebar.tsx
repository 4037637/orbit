"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, ChevronsUpDown, Plus, LogOut, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Workspace } from "@/lib/data/boards";

interface SidebarProps {
  workspaces: Workspace[];
  user: { full_name: string | null; avatar_url: string | null; email: string };
}

export function Sidebar({ workspaces, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const currentSlug = pathname.split("/")[1] ?? "";
  const currentWorkspace = workspaces.find((w) => w.slug === currentSlug);

  const initials = (user.full_name ?? user.email)
    .split(/[\s@]/)
    .filter(Boolean)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="w-60 shrink-0 border-r flex flex-col h-full bg-background">
      {/* Workspace switcher */}
      <div className="p-2 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-full justify-between"
            )}
          >
            <span className="truncate font-medium">
              {currentWorkspace?.name ?? "Select workspace"}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start">
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                className={cn(ws.slug === currentSlug && "bg-accent")}
                onClick={() => router.push(`/${ws.slug}/boards`)}
              >
                {ws.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/onboarding")}>
              <Plus className="size-4" />
              New workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        <Link
          href={`/${currentSlug}/boards`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-full justify-start gap-2",
            pathname.startsWith(`/${currentSlug}/boards`) && "bg-accent text-accent-foreground"
          )}
        >
          <LayoutGrid className="size-4" />
          Boards
        </Link>
        <Link
          href={`/${currentSlug}/settings`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-full justify-start gap-2",
            pathname.startsWith(`/${currentSlug}/settings`) && "bg-accent text-accent-foreground"
          )}
        >
          <Settings className="size-4" />
          Settings
        </Link>
      </nav>

      {/* User footer */}
      <div className="p-2 border-t">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar size="sm">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            {user.full_name && (
              <p className="truncate text-sm font-medium">{user.full_name}</p>
            )}
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
