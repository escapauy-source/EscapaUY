-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- Create exchange_rates table
create table if not exists public.exchange_rates (
    id uuid primary key default uuid_generate_v4(),
    currency_pair text not null unique, -- e.g. 'USD_UYU'
    api_rate numeric not null,
    manual_rate numeric, -- Nullable. If set, overrides api_rate
    is_manual boolean default false,
    last_updated timestamptz default now()
);

-- Enable RLS
alter table public.exchange_rates enable row level security;

-- Policies
-- Public Read: Everyone can read the rates (needed for Checkout)
create policy "Public Read Rates"
    on public.exchange_rates for select
    using (true);

-- Admin Write: Only authenticated admins can update (Manual Override)
create policy "Admin Update Rates"
    on public.exchange_rates for all
    using (auth.role() = 'authenticated'); -- or more specific admin logic if needed

-- Seed initial data if empty
insert into public.exchange_rates (currency_pair, api_rate, is_manual, last_updated)
values ('USD_UYU', 40.0, false, now())
on conflict (currency_pair) do nothing;
