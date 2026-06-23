import { streamText, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug, getBoards } from "@/lib/data/boards";
import { getBoardData, getWorkspaceMembers } from "@/lib/data/issues";
import { canUseAI, type Plan } from "@/lib/plans";
import type { Member } from "@/lib/data/issues";

type Context = { params: Promise<{ workspaceSlug: string }> };

export async function POST(request: Request, context: Context) {
  const { workspaceSlug } = await context.params;
  const { messages } = await request.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getWorkspaceBySlug(supabase, workspaceSlug);
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  if (!canUseAI((profile?.plan ?? "free") as Plan)) {
    return NextResponse.json({ error: "AI Assistant requires the Pro plan." }, { status: 403 });
  }

  const [boards, members] = await Promise.all([
    getBoards(supabase, workspace.id),
    getWorkspaceMembers(supabase, workspace.id),
  ]);

  const allBoardData = await Promise.all(
    boards.map((b) => getBoardData(supabase, b.id).then((cols) => ({ board: b, cols })))
  );

  const memberById = new Map<string, Member>(members.map((m) => [m.userId, m]));

  const memberLines = members
    .map((m) => `- ${m.fullName ?? m.email} (${m.role})`)
    .join("\n");

  const boardLines = allBoardData
    .map(({ board, cols }) => {
      const colLines = cols
        .map((col) => {
          if (col.issues.length === 0) return null;
          const issueLines = col.issues
            .map((issue) => {
              const assignee = issue.assignee_id
                ? (memberById.get(issue.assignee_id)?.fullName ??
                    memberById.get(issue.assignee_id)?.email ??
                    "Unknown")
                : "Unassigned";
              const due = issue.due_date ?? "none";
              const labelNames = issue.labels.map((l) => l.name).join(", ") || "none";
              return `    • [${issue.priority.toUpperCase()}] ${issue.title} — Assigned: ${assignee} | Due: ${due} | Labels: ${labelNames}`;
            })
            .join("\n");
          return `  [${col.name}]\n${issueLines}`;
        })
        .filter(Boolean)
        .join("\n");
      return `Board: ${board.name}\n${colLines || "  (no issues)"}`;
    })
    .join("\n\n");

  const today = new Date().toISOString().split("T")[0];

  const system = `You are an AI assistant for Orbit, a project management tool.
You have full read access to all issues in this workspace. Today's date is ${today}.
Answer questions concisely. Use bullet points for lists. When referencing issues, include the board and status column.

Workspace: ${workspace.name}

Members:
${memberLines || "- (none)"}

---

${boardLines || "(no boards or issues yet)"}`;

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
