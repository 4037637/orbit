create table if not exists public.subscriptions (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.profiles on delete cascade,
  stripe_subscription_id text unique,
  stripe_customer_id    text,
  plan                  text not null default 'free' check (plan in ('free', 'lite', 'pro')),
  status                text not null default 'active',
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create trigger set_updated_at before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

grant select, insert, update, delete on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;
