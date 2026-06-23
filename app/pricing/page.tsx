import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS, type Plan } from "@/lib/plans";

const FEATURES: Record<Plan, string[]> = {
  free: [
    "1 workspace",
    "Unlimited boards",
    "Solo — no team members",
    "Email support",
  ],
  lite: [
    "10 workspaces",
    "Unlimited boards",
    "2 team members per workspace",
    "Email invitations",
    "Email support",
  ],
  pro: [
    "Unlimited workspaces",
    "Unlimited boards",
    "Unlimited team members",
    "Email invitations",
    "Priority support",
  ],
};

const HIGHLIGHTED: Plan = "lite";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            Orbit
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-2 rounded-md font-medium"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">
        {/* Heading */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start for free. Upgrade as your team grows.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {(["free", "lite", "pro"] as Plan[]).map((plan) => {
            const isHighlighted = plan === HIGHLIGHTED;
            return (
              <div
                key={plan}
                className={`relative rounded-2xl border p-8 flex flex-col gap-6 ${
                  isHighlighted
                    ? "border-primary ring-2 ring-primary shadow-lg"
                    : "shadow-sm"
                }`}
              >
                {isHighlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most popular
                  </span>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    {PLANS[plan].name}
                  </p>
                  <p className="text-4xl font-bold">
                    {PLANS[plan].price === 0 ? (
                      "Free"
                    ) : (
                      <>
                        ${PLANS[plan].price}
                        <span className="text-base font-normal text-muted-foreground">
                          /mo
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <ul className="space-y-3 flex-1">
                  {FEATURES[plan].map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="size-4 mt-0.5 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`text-center text-sm font-medium py-2.5 rounded-lg transition-colors ${
                    isHighlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-input hover:bg-accent"
                  }`}
                >
                  {PLANS[plan].price === 0 ? "Get started free" : "Start free trial"}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <div className="rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-6 py-4 font-medium w-1/2">Feature</th>
                <th className="text-center px-6 py-4 font-medium">Free</th>
                <th className="text-center px-6 py-4 font-medium">Lite</th>
                <th className="text-center px-6 py-4 font-medium">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                ["Workspaces", "1", "10", "Unlimited"],
                ["Team members", "Solo only", "2 per workspace", "Unlimited"],
                ["Boards per workspace", "Unlimited", "Unlimited", "Unlimited"],
                ["Email invitations", "—", "✓", "✓"],
                ["Priority support", "—", "—", "✓"],
              ].map(([feature, free, lite, pro]) => (
                <tr key={feature} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">{feature}</td>
                  <td className="px-6 py-4 text-center">{free}</td>
                  <td className="px-6 py-4 text-center">{lite}</td>
                  <td className="px-6 py-4 text-center">{pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ / CTA */}
        <div className="text-center mt-20">
          <p className="text-muted-foreground mb-4">
            Questions? We&apos;re happy to help.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-3 rounded-lg font-medium"
          >
            Get started for free
          </Link>
        </div>
      </main>
    </div>
  );
}
