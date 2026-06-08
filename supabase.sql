-- Supabase schema for Serena Vet
-- Run this SQL in the SQL editor of your Supabase project.
-- If you already created `appointments` con otro esquema, ajusta la tabla con ALTER TABLE o vuelve a crearla.

-- Table: appointments
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  owner_name text not null,
  email text not null,
  phone text,
  pet_name text,
  pet_type text,
  pet_breed text,
  pet_age text,
  service text,
  date date,
  time text,
  notes text,
  status text default 'requested', -- requested, confirmed, cancelled, completed
  created_at timestamptz default now()
);

revoke all on public.appointments from anon, authenticated;
grant insert (owner_name, email, phone, pet_name, pet_type, pet_breed, pet_age, service, date, time, notes, status)
on public.appointments to anon, authenticated;
grant select (id, service, date, time, status, created_at)
on public.appointments to anon;
grant select on public.appointments to authenticated;
grant update(status) on public.appointments to authenticated;
grant delete on public.appointments to authenticated;

-- Enable row level security and create the policies needed for anonymous inserts.
alter table public.appointments enable row level security;
drop policy if exists "public_insert_appointments" on public.appointments;
drop policy if exists "public_read_schedule" on public.appointments;
drop policy if exists "auth_manage_appointments" on public.appointments;

create policy "public_insert_appointments" on public.appointments
  for insert
  with check (true);

create policy "public_read_schedule" on public.appointments
  for select
  using (true);

create policy "auth_manage_appointments_update" on public.appointments
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "auth_manage_appointments_delete" on public.appointments
  for delete
  using (auth.role() = 'authenticated');

-- If the table already exists with an older schema, update it manually:
-- ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS pet_type text;
-- ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS pet_breed text;
-- ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS pet_age text;
-- ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS service text;
-- ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS time text;

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
