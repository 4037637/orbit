import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getWorkspaceBySlug } from "@/lib/data/boards";
import { PLANS, workspaceLimit, memberLimit, type Plan } from "@/lib/plans";
import { PlanPoller } from "@/components/billing/plan-poller";
import { PlanCardButton } from "@/components/billing/plan-card-button";
import { Check } from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ success?: string; plan?: string }>;
};

const PLAN_TAGLINES: Record<Plan, string> = {
  free: "Get started solo",
  lite: "For small teams",
  pro: "Scale without limits",
};

const PLAN_FEATURES: Record<Plan, string[]> = {
  free: [
    "1 workspace",
    "Solo only — no team members",
    "Unlimited boards & issues",
  ],
  lite: [
    "10 workspaces",
    "Up to 2 team members each",
    "Unlimited boards & issues",
    "Email invitations",
  ],
  pro: [
    "Unlimited workspaces",
    "Unlimited team members",
    "Unlimited boards & issues",
    "Email invitations",
    "Priority support",
  ],
};

function UsageBar({ used, limit }: { used: number; limit: number | "unlimited" }) {
  const pct = limit === "unlimited" ? 0 : Math.min((used / limit) * 100, 100);
  const atLimit = limit !== "unlimited" && used >= limit;
  return (
    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${atLimit ? "bg-destructive" : "bg-primary"}`}
        style={{ width: limit === "unlimited" ? "0%" : `${pct}%` }}
      />
    </div>
  );
}

export default async function BillingPage({ params, searchParams }: PageProps) {
  const [{ workspaceSlug }, sp] = await Promise.all([params, searchParams]);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspaceBySlug(supabase, workspaceSlug);
  if (!workspace) redirect("/dashboard");

  const service = createServiceClient();

  const [profileResult, ownedCountResult, membersResult] = await Promise.all([
    supabase.from("profiles").select("plan, stripe_customer_id").eq("id", user.id).single(),
    supabase
      .from("workspaces")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id),
    service.from("workspace_members").select("role").eq("workspace_id", workspace.id),
  ]);

  const plan = (profileResult.data?.plan ?? "free") as Plan;
  const hasStripeCustomer = Boolean(profileResult.data?.stripe_customer_id);
  const ownedCount = ownedCountResult.count ?? 0;
  const nonOwnerCount = (membersResult.data ?? []).filter((m) => m.role !== "owner").length;

  const wsLimit = workspaceLimit(plan);
  const mLimit = memberLimit(plan);

  const justUpgraded = sp.success === "1";
  const expectedPlan = (sp.plan ?? null) as Plan | null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {justUpgraded && expectedPlan && (
        <PlanPoller expectedPlan={expectedPlan} currentPlan={plan} />
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription and usage.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(["free", "lite", "pro"] as Plan[]).map((p) => {
          const isCurrent = p === plan;
          return (
            <div
              key={p}
              className={`rounded-lg border p-5 flex flex-col gap-4 ${
                isCurrent ? "border-primary ring-1 ring-primary" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-semibold">{PLANS[p].name}</p>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">{PLAN_TAGLINES[p]}</p>
                <p className="text-2xl font-bold">
                  {PLANS[p].price === 0 ? "Free" : `$${PLANS[p].price}`}
                  {PLANS[p].price > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  )}
                </p>
              </div>

              <ul className="space-y-1.5 flex-1 text-sm">
                {PLAN_FEATURES[p].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="size-3.5 mt-0.5 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <PlanCardButton
                targetPlan={p}
                currentPlan={plan}
                workspaceSlug={workspaceSlug}
                hasStripeCustomer={hasStripeCustomer}
              />
            </div>
          );
        })}
      </div>

      {/* Usage */}
      <section className="rounded-lg border p-6 space-y-5">
        <h2 className="text-base font-semibold">Usage</h2>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span>Owned workspaces</span>
            <span className="font-medium text-muted-foreground">
              {ownedCount} / {wsLimit === "unlimited" ? "∞" : wsLimit}
            </span>
          </div>
          <UsageBar used={ownedCount} limit={wsLimit} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span>Members in this workspace</span>
            <span className="font-medium text-muted-foreground">
              {nonOwnerCount} / {mLimit === "unlimited" ? "∞" : mLimit}
            </span>
          </div>
          <UsageBar used={nonOwnerCount} limit={mLimit} />
        </div>
      </section>
    </div>
  );
}
