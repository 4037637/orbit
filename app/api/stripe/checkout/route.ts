import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const { plan, workspaceSlug } = await request.json();

  if (!plan || !["lite", "pro"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, stripe_subscription_id, email")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    const { error: saveError } = await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
    if (saveError) {
      console.error("Failed to save stripe_customer_id:", saveError.message);
    }
  }

  const priceId =
    plan === "lite"
      ? process.env.STRIPE_LITE_PRICE_ID!
      : process.env.STRIPE_PRO_PRICE_ID!;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const returnBase = workspaceSlug
    ? `${baseUrl}/${workspaceSlug}/billing`
    : `${baseUrl}/dashboard`;

  // If user already has an active subscription, route the upgrade through the billing portal
  // instead of creating a second subscription.
  if (profile?.stripe_subscription_id) {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnBase,
    });
    return NextResponse.json({ url: portalSession.url });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: user.id, plan },
    success_url: `${returnBase}?success=1&plan=${plan}`,
    cancel_url: returnBase,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
