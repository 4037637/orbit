import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Supabase = SupabaseClient<Database>;

export type Column = Database["public"]["Tables"]["columns"]["Row"];
export type Issue = Database["public"]["Tables"]["issues"]["Row"];
export type Label = Database["public"]["Tables"]["labels"]["Row"];

export type Member = {
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: 'owner' | 'member';
  joinedAt: string | null;
};

export type IssueWithLabels = Issue & { labels: Label[] };
export type ColumnWithIssues = Column & { issues: IssueWithLabels[] };

const DEFAULT_COLUMNS = ["Todo", "In Progress", "Done"];

export async function getBoardData(
  supabase: Supabase,
  boardId: string
): Promise<ColumnWithIssues[]> {
  const { data: cols } = await supabase
    .from("columns")
    .select("*")
    .eq("board_id", boardId)
    .order("position");

  let columns = cols ?? [];

  if (columns.length === 0) {
    const inserts = DEFAULT_COLUMNS.map((name, i) => ({
      board_id: boardId,
      name,
      position: i + 1,
    }));
    const { data: created } = await supabase
      .from("columns")
      .insert(inserts)
      .select();
    columns = created ?? [];
  }

  const { data: issues } = await supabase
    .from("issues")
    .select("*")
    .eq("board_id", boardId)
    .order("position");

  // Fetch labels for all issues on this board
  const issueIds = (issues ?? []).map((i) => i.id);
  let labelsByIssue = new Map<string, Label[]>();

  if (issueIds.length > 0) {
    const { data: junctions } = await supabase
      .from("issue_labels")
      .select("issue_id, labels(*)")
      .in("issue_id", issueIds);

    for (const row of junctions ?? []) {
      const label = row.labels as unknown as Label;
      if (!label) continue;
      const list = labelsByIssue.get(row.issue_id) ?? [];
      list.push(label);
      labelsByIssue.set(row.issue_id, list);
    }
  }

  const issuesByColumn = new Map<string, IssueWithLabels[]>();
  for (const issue of issues ?? []) {
    const withLabels: IssueWithLabels = {
      ...issue,
      labels: labelsByIssue.get(issue.id) ?? [],
    };
    const list = issuesByColumn.get(issue.column_id) ?? [];
    list.push(withLabels);
    issuesByColumn.set(issue.column_id, list);
  }

  return columns.map((col) => ({
    ...col,
    issues: issuesByColumn.get(col.id) ?? [],
  }));
}

export async function getWorkspaceLabels(
  supabase: Supabase,
  workspaceId: string
): Promise<Label[]> {
  const { data } = await supabase
    .from("labels")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name");
  return data ?? [];
}

export async function getWorkspaceMembers(
  supabase: Supabase,
  workspaceId: string
): Promise<Member[]> {
  const { data } = await supabase
    .from("workspace_members")
    .select("user_id, role, joined_at, profiles(email, full_name, avatar_url)")
    .eq("workspace_id", workspaceId);

  return (data ?? []).map((row) => {
    const p = row.profiles as { email: string; full_name: string | null; avatar_url: string | null } | null;
    return {
      userId: row.user_id,
      role: row.role as 'owner' | 'member',
      joinedAt: row.joined_at,
      email: p?.email ?? "",
      fullName: p?.full_name ?? null,
      avatarUrl: p?.avatar_url ?? null,
    };
  });
}
