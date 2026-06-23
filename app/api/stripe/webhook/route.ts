import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import type { Plan } from "@/lib/plans";

export const dynamic = "force-dynamic";

function priceIdToPlan(priceId: string | undefined): Plan {
  if (priceId === process.env.STRIPE_LITE_PRICE_ID) return "lite";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  return "free";
}

function toIso(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString();
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid." }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as Plan | undefined;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

      if (userId && plan && subscriptionId) {
        const customerId = session.customer as string;

        // Critical: update the plan on the profile
        const { error } = await supabase
          .from("profiles")
          .update({ plan, stripe_customer_id: customerId, stripe_subscription_id: subscriptionId })
          .eq("id", userId);
        if (error) {
          console.error("[webhook] profiles update failed:", error.message);
          return NextResponse.json({ error: "DB update failed." }, { status: 500 });
        }

        // Non-critical: populate subscriptions table (best-effort)
        try {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const item = sub.items.data[0];
          const { error: subError } = await supabase
            .from("subscriptions")
            .upsert(
              {
                user_id: userId,
                stripe_subscription_id: subscriptionId,
                stripe_customer_id: customerId,
                plan,
                status: sub.status,
                current_period_start: item ? toIso(item.current_period_start) : null,
                current_period_end: item ? toIso(item.current_period_end) : null,
                cancel_at_period_end: sub.cancel_at_period_end,
              },
              { onConflict: "stripe_subscription_id" }
            );
          if (subError) console.error("[webhook] subscriptions upsert failed:", subError.message);
        } catch (err) {
          console.error("[webhook] subscriptions step threw:", err);
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object;
      const failedStatuses = ["past_due", "unpaid", "canceled"];
      const plan = failedStatuses.includes(sub.status)
        ? ("free" as Plan)
        : priceIdToPlan(sub.items.data[0]?.price.id);

      const { error } = await supabase
        .from("profiles")
        .update({ plan })
        .eq("stripe_subscription_id", sub.id);
      if (error) {
        console.error("[webhook] profiles update failed:", error.message);
        return NextResponse.json({ error: "DB update failed." }, { status: 500 });
      }

      // Non-critical
      try {
        const updatedItem = sub.items.data[0];
        const { error: subError } = await supabase
          .from("subscriptions")
          .update({
            plan,
            status: sub.status,
            current_period_start: updatedItem ? toIso(updatedItem.current_period_start) : undefined,
            current_period_end: updatedItem ? toIso(updatedItem.current_period_end) : undefined,
            cancel_at_period_end: sub.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", sub.id);
        if (subError) console.error("[webhook] subscriptions update failed:", subError.message);
      } catch (err) {
        console.error("[webhook] subscriptions step threw:", err);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;

      const { error } = await supabase
        .from("profiles")
        .update({ plan: "free", stripe_subscription_id: null })
        .eq("stripe_subscription_id", sub.id);
      if (error) {
        console.error("[webhook] profiles update failed:", error.message);
        return NextResponse.json({ error: "DB update failed." }, { status: 500 });
      }

      // Non-critical
      try {
        const { error: subError } = await supabase
          .from("subscriptions")
          .update({ plan: "free", status: "canceled" })
          .eq("stripe_subscription_id", sub.id);
        if (subError) console.error("[webhook] subscriptions update failed:", subError.message);
      } catch (err) {
        console.error("[webhook] subscriptions step threw:", err);
      }
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
