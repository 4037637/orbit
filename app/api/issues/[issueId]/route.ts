import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type Context = { params: Promise<{ issueId: string }> };
type IssueUpdate = Database["public"]["Tables"]["issues"]["Update"];

export async function PATCH(request: Request, context: Context) {
  const { issueId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const allowed: (keyof IssueUpdate)[] = [
    "title", "description", "priority", "column_id", "position", "assignee_id", "due_date",
  ];
  const update: IssueUpdate = {};
  for (const key of allowed) {
    if (key in body) (update as Record<string, unknown>)[key] = body[key] ?? null;
  }

  const { data: issue, error } = await supabase
    .from("issues")
    .update(update)
    .eq("id", issueId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Replace labels if provided
  if (Array.isArray(body.label_ids)) {
    await supabase.from("issue_labels").delete().eq("issue_id", issueId);
    if (body.label_ids.length > 0) {
      await supabase.from("issue_labels").insert(
        (body.label_ids as string[]).map((lid) => ({ issue_id: issueId, label_id: lid }))
      );
    }
  }

  return NextResponse.json(issue);
}

export async function DELETE(_request: Request, context: Context) {
  const { issueId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("issues").delete().eq("id", issueId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return new NextResponse(null, { status: 204 });
}
