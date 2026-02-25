-- Stores stripe customer + subscription info for each user
create table if not exists public.user_billing (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status text,
  current_period_end timestamptz,
  updated_at timestamptz default now()
);

-- Optional: store app usage / plan
create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text default 'free',
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.user_billing enable row level security;
alter table public.user_entitlements enable row level security;

-- Policies
do $$ 
begin 
  if not exists (select 1 from pg_policies where policyname = 'user can read own billing') then
    create policy "user can read own billing" on public.user_billing for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'user can read own entitlements') then
    create policy "user can read own entitlements" on public.user_entitlements for select using (auth.uid() = user_id);
  end if;
end $$;
