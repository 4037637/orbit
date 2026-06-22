import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { acceptInvitation } from "@/lib/data/invitations";

type Context = { params: Promise<{ token: string }> };

export async function POST(_request: Request, context: Context) {
  const { token } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const result = await acceptInvitation(service, token, user.id);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ workspaceSlug: result.workspaceSlug }, { status: result.status });
}
