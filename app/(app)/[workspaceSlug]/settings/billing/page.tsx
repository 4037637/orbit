import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ workspaceSlug: string }> };

export default async function BillingRedirect({ params }: PageProps) {
  const { workspaceSlug } = await params;
  redirect(`/${workspaceSlug}/billing`);
}
