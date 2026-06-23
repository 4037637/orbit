-- Move billing fields from workspaces to profiles (user-level billing)
alter table public.profiles
  add column plan text not null default 'free'
    check (plan in ('free', 'lite', 'pro')),
  add column stripe_customer_id text,
  add column stripe_subscription_id text;

alter table public.workspaces
  drop column plan,
  drop column stripe_customer_id,
  drop column stripe_subscription_id;
