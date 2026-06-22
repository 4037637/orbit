import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { column_id, board_id, title, description, priority, due_date, label_ids } =
    await request.json();

  if (!column_id || !board_id || !title?.trim()) {
    return NextResponse.json(
      { error: "column_id, board_id, and title are required." },
      { status: 400 }
    );
  }

  const { data: last } = await supabase
    .from("issues")
    .select("position")
    .eq("column_id", column_id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (last?.position ?? 0) + 1;

  const { data: issue, error } = await supabase
    .from("issues")
    .insert({
      column_id,
      board_id,
      title: title.trim(),
      description: description ?? null,
      priority: priority ?? "none",
      due_date: due_date || null,
      position,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (Array.isArray(label_ids) && label_ids.length > 0) {
    await supabase.from("issue_labels").insert(
      label_ids.map((lid: string) => ({ issue_id: issue.id, label_id: lid }))
    );
  }

  return NextResponse.json(issue, { status: 201 });
}
