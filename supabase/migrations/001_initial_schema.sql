-- David Slings — Initial Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/sxsmcywsfhxosnkmocrx/sql

-- Customers table (populated by Stripe webhook)
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  stripe_customer_id text unique,
  created_at timestamptz default now()
);

-- Orders table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id),
  stripe_checkout_session_id text unique not null,
  stripe_payment_intent_id text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
  amount_cents integer not null,
  currency text not null default 'usd',
  quantity integer not null default 1,
  shipping_name text,
  shipping_address jsonb,
  tracking_number text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Admin users (linked to Supabase Auth)
create table public.admin_users (
  id uuid primary key references auth.users(id),
  email text not null,
  created_at timestamptz default now()
);

-- Auto-update updated_at on orders
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.update_updated_at();

-- Enable RLS
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.admin_users enable row level security;

-- Admin full access policies
create policy "Admin full access to customers"
  on public.customers for all
  using (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admin full access to orders"
  on public.orders for all
  using (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admin can read own admin record"
  on public.admin_users for select
  using (id = auth.uid());

-- Indexes
create index idx_orders_status on public.orders(status);
create index idx_orders_created_at on public.orders(created_at desc);
create index idx_customers_email on public.customers(email);
create index idx_customers_stripe_id on public.customers(stripe_customer_id);
