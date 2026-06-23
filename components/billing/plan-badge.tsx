import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/plans";

const STYLES: Record<Plan, string> = {
  free: "bg-muted text-muted-foreground",
  lite: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  pro:  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

interface Props {
  plan: Plan;
  className?: string;
}

export function PlanBadge({ plan, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        STYLES[plan],
        className
      )}
    >
      {plan}
    </span>
  );
}
