"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WorkspaceForm } from "@/components/onboarding/workspace-form";
import { TeamInviteForm } from "@/components/onboarding/team-invite-form";
import { OnboardingDone } from "@/components/onboarding/onboarding-done";

type Step = 1 | 2 | 3;

const STEP_META: Record<
  1 | 2,
  { title: string; description: string }
> = {
  1: {
    title: "Create your workspace",
    description:
      "A workspace is where your team's boards and issues live.",
  },
  2: {
    title: "Invite your team",
    description: "Add teammates by email — you can always do this later.",
  },
};

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [workspace, setWorkspace] = useState<{
    name: string;
    slug: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleWorkspace(data: { name: string; slug: string }) {
    setWorkspace(data);
    setStep(2);
  }

  async function handleInvites(emails: string[]) {
    if (!workspace) return;
    setError(null);
    setLoading(true);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceName: workspace.name,
        slug: workspace.slug,
        inviteEmails: emails,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Please try again.");
      return;
    }

    setStep(3);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {step < 3 && (
          <div className="flex items-center gap-3">
            {([1, 2] as const).map((n, i) => (
              <div key={n} className="flex items-center gap-3">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    step === n
                      ? "bg-primary text-primary-foreground"
                      : step > n
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {n}
                </div>
                <span
                  className={`text-sm ${step === n ? "font-medium" : "text-muted-foreground"}`}
                >
                  {STEP_META[n].title}
                </span>
                {i < 1 && <div className="h-px w-8 bg-border" />}
              </div>
            ))}
          </div>
        )}

        <Card>
          {step < 3 && (
            <CardHeader>
              <CardTitle>{STEP_META[step as 1 | 2].title}</CardTitle>
              <CardDescription>
                {STEP_META[step as 1 | 2].description}
              </CardDescription>
            </CardHeader>
          )}

          <CardContent className={step === 3 ? "pt-6" : ""}>
            {error && (
              <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {step === 1 && <WorkspaceForm onNext={handleWorkspace} />}
            {step === 2 && (
              <TeamInviteForm onNext={handleInvites} loading={loading} />
            )}
            {step === 3 && workspace && (
              <OnboardingDone workspaceName={workspace.name} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
