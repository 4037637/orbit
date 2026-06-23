"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/lib/plans";

interface Props {
  targetPlan: Plan;
  currentPlan: Plan;
  workspaceSlug: string;
  hasStripeCustomer: boolean;
}

export function PlanCardButton({ targetPlan, currentPlan, workspaceSlug, hasStripeCustomer }: Props) {
  const [loading, setLoading] = useState(false);

  const isCurrent = targetPlan === currentPlan;
  const isUpgrade =
    (targetPlan === "lite" && currentPlan === "free") ||
    (targetPlan === "pro" && currentPlan !== "pro");

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan, workspaceSlug }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  if (isCurrent) {
    return (
      <Button variant="outline" size="sm" className="w-full" disabled>
        Current plan
      </Button>
    );
  }

  // Downgrade to free or from pro to lite → billing portal
  if (targetPlan === "free" || (targetPlan === "lite" && currentPlan === "pro")) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={openPortal}
        disabled={loading || !hasStripeCustomer}
      >
        {loading ? "Redirecting…" : "Manage billing"}
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant={isUpgrade ? "default" : "outline"}
      className="w-full"
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? "Redirecting…" : `Upgrade to ${targetPlan === "lite" ? "Lite" : "Pro"}`}
    </Button>
  );
}
