import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface Props {
  workspaceName: string;
}

export function OnboardingDone({ workspaceName }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <CheckCircle2 className="size-12 text-green-500" />
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">You&apos;re all set!</h2>
        <p className="text-sm text-muted-foreground">
          <strong>{workspaceName}</strong> is ready. Let&apos;s start building.
        </p>
      </div>
      <Link href="/dashboard" className={cn(buttonVariants(), "mt-2 w-full")}>
        Open workspace →
      </Link>
    </div>
  );
}
