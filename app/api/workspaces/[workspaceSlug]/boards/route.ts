import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug, getBoards } from "@/lib/data/boards";

type Context = { params: Promise<{ workspaceSlug: string }> };

export async function GET(_request: Request, context: Context) {
  const { workspaceSlug } = await context.params;
  const supabase = await createClient();

  const workspace = await getWorkspaceBySlug(supabase, workspaceSlug);
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const boards = await getBoards(supabase, workspace.id);
  return NextResponse.json(boards);
}

export async function POST(request: Request, context: Context) {
  const { workspaceSlug } = await context.params;
  const { name, description } = await request.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Board name is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getWorkspaceBySlug(supabase, workspaceSlug);
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get current max position to append new board at end
  const { data: last } = await supabase
    .from("boards")
    .select("position")
    .eq("workspace_id", workspace.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (last?.position ?? 0) + 1;

  const { data: board, error } = await supabase
    .from("boards")
    .insert({
      workspace_id: workspace.id,
      name: name.trim(),
      description: description ?? null,
      position,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(board, { status: 201 });
}
