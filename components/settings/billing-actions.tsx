"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PLANS, type Plan } from "@/lib/plans";

interface Props {
  currentPlan: Plan;
  hasStripeCustomer: boolean;
  workspaceSlug: string;
}

export function BillingActions({ currentPlan, hasStripeCustomer, workspaceSlug }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  async function checkout(plan: "lite" | "pro") {
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

  async function openPortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {currentPlan === "free" && (
        <>
          <Button
            size="sm"
            onClick={() => checkout("lite")}
            disabled={loading !== null}
          >
            {loading === "lite" ? "Redirecting…" : `Upgrade to Lite — $${PLANS.lite.price}/mo`}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => checkout("pro")}
            disabled={loading !== null}
          >
            {loading === "pro" ? "Redirecting…" : `Upgrade to Pro — $${PLANS.pro.price}/mo`}
          </Button>
        </>
      )}
      {currentPlan === "lite" && (
        <Button
          size="sm"
          onClick={() => checkout("pro")}
          disabled={loading !== null}
        >
          {loading === "pro" ? "Redirecting…" : `Upgrade to Pro — $${PLANS.pro.price}/mo`}
        </Button>
      )}
      {hasStripeCustomer && (
        <Button
          size="sm"
          variant="outline"
          onClick={openPortal}
          disabled={loading !== null}
        >
          {loading === "portal" ? "Redirecting…" : "Manage billing"}
        </Button>
      )}
    </div>
  );
}
