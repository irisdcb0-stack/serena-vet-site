-- Supabase schema for Serena Vet
-- Run this SQL in the SQL editor of your Supabase project

-- Table: appointments
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  owner_name text not null,
  email text not null,
  phone text,
  pet_name text,
  service_id uuid references public.services(id) on delete set null,
  date date,
  time_from timestamptz,
  time_to timestamptz,
  notes text,
  price_estimate numeric,
  status text default 'requested', -- requested, confirmed, cancelled, completed
  created_at timestamptz default now()
);

-- Table: services (catalog of possible services)
create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  default_duration_minutes integer not null,
  base_price numeric,
  description text
);

-- Table: availability (veterinary working hours and blackout days)
create table if not exists public.availability (
  id uuid default gen_random_uuid() primary key,
  day_of_week integer, -- 0=Sunday, 1=Monday ... null for specific date
  date date, -- optional specific date to block or open
  start_time time,
  end_time time,
  is_closed boolean default false,
  notes text
);

-- Table: prices (service modifiers by size/complexity)
create table if not exists public.prices (
  id uuid default gen_random_uuid() primary key,
  service_id uuid references public.services(id) on delete cascade,
  size_category text, -- small, medium, large
  complexity text, -- basic, medium, advanced
  price numeric
);

-- Optional: enable row level security if you plan to use policies
-- alter table public.appointments enable row level security;

-- Add any additional tables you want (contacts, users, services, etc.)
