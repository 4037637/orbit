"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PLANS, type Plan } from "@/lib/plans";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: "workspace" | "members" | "ai";
  currentPlan: Plan;
  workspaceSlug?: string;
}

const FEATURES: Record<Plan, string[]> = {
  free: ["1 workspace", "Solo only", "Unlimited boards"],
  lite: ["10 workspaces", "2 team members each", "Unlimited boards", "Email invitations"],
  pro: ["Unlimited workspaces", "Unlimited members", "Unlimited boards", "Email invitations", "AI Assistant", "Priority support"],
};

export function UpgradeDialog({ open, onOpenChange, reason, currentPlan, workspaceSlug }: Props) {
  const [loading, setLoading] = useState<"lite" | "pro" | null>(null);

  const title =
    reason === "workspace"
      ? "You've reached your workspace limit"
      : reason === "members"
      ? "You've reached your member limit"
      : "AI Assistant is a Pro feature";

  const description =
    reason === "workspace"
      ? `The ${PLANS[currentPlan].name} plan allows ${PLANS[currentPlan].workspaces} workspace${PLANS[currentPlan].workspaces === 1 ? "" : "s"}. Upgrade to create more.`
      : reason === "members"
      ? `The ${PLANS[currentPlan].name} plan allows ${PLANS[currentPlan].members} extra member${PLANS[currentPlan].members === 1 ? "" : "s"}. Upgrade to invite more people.`
      : "Upgrade to Pro to chat with your issues and get AI-powered insights across all your boards.";

  async function upgrade(plan: "lite" | "pro") {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, workspaceSlug }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-2">
          {(["free", "lite", "pro"] as Plan[]).map((plan) => {
            const isCurrent = plan === currentPlan;
            const isHighlighted = plan !== "free" && PLANS[plan].price > PLANS[currentPlan].price;
            return (
              <div
                key={plan}
                className={`rounded-lg border p-4 flex flex-col gap-3 ${
                  isHighlighted ? "border-primary ring-1 ring-primary" : ""
                } ${isCurrent ? "opacity-60" : ""}`}
              >
                <div>
                  <p className="font-semibold">{PLANS[plan].name}</p>
                  <p className="text-2xl font-bold mt-1">
                    ${PLANS[plan].price}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                </div>
                <ul className="space-y-1.5 flex-1">
                  {FEATURES[plan].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="size-3.5 mt-0.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan === "free" ? (
                  <Button variant="outline" size="sm" disabled>
                    {isCurrent ? "Current plan" : "Free"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant={isHighlighted ? "default" : "outline"}
                    disabled={isCurrent || loading !== null}
                    onClick={() => upgrade(plan as "lite" | "pro")}
                  >
                    {loading === plan
                      ? "Redirecting…"
                      : isCurrent
                      ? "Current plan"
                      : `Upgrade to ${PLANS[plan].name}`}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
