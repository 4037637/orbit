"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/plans";

const MAX_ATTEMPTS = 8; // ~16 seconds

interface Props {
  expectedPlan: Plan;
  currentPlan: Plan;
}

export function PlanPoller({ expectedPlan, currentPlan }: Props) {
  const router = useRouter();
  const attempts = useRef(0);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (currentPlan === expectedPlan || timedOut) return;

    const id = setInterval(() => {
      attempts.current += 1;
      if (attempts.current >= MAX_ATTEMPTS) {
        clearInterval(id);
        setTimedOut(true);
        return;
      }
      router.refresh();
    }, 2000);

    return () => clearInterval(id);
  }, [currentPlan, expectedPlan, router, timedOut]);

  if (currentPlan === expectedPlan) {
    return (
      <div className="rounded-md bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400 mb-6">
        Your plan has been upgraded successfully.
      </div>
    );
  }

  if (timedOut) {
    return (
      <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 mb-6">
        Payment received — your plan will activate shortly. Refresh the page to check.
      </div>
    );
  }

  return (
    <div className="rounded-md bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-sm text-blue-700 dark:text-blue-400 mb-6 flex items-center gap-2">
      <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
      Activating your new plan…
    </div>
  );
}
