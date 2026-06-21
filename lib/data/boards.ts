import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Supabase = SupabaseClient<Database>;

export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type Board = Database["public"]["Tables"]["boards"]["Row"];

export async function getUserWorkspaces(supabase: Supabase): Promise<Workspace[]> {
  const { data } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at");
  return data ?? [];
}

export async function getWorkspaceBySlug(
  supabase: Supabase,
  slug: string
): Promise<Workspace | null> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error?.code === "PGRST116") return null;
  return data;
}

export async function getBoards(
  supabase: Supabase,
  workspaceId: string
): Promise<Board[]> {
  const { data } = await supabase
    .from("boards")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("position");
  return data ?? [];
}
