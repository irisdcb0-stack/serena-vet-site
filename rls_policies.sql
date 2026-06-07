-- Example RLS policies for Serena Vet
-- Use cautiously and adapt to your authentication model

-- Enable row level security on appointments
alter table public.appointments enable row level security;

-- Policy: allow anyone to insert a new appointment but force status = 'requested'
create policy "public_insert_appointments" on public.appointments
for insert
with check (status = 'requested');

-- Policy: allow only authenticated users (via Supabase Auth) to select/update/delete
-- This example checks that the request is authenticated. Adjust to check for admin role/claim.
create policy "auth_select_update_appointments" on public.appointments
for select, update, delete
using (auth.role() = 'authenticated');

-- Note: For admin-only operations, use custom claims (e.g., 'is_admin') in JWT and check:
-- using ( (auth.role() = 'authenticated') AND (current_setting('request.jwt.claims', true) ->> 'is_admin')::boolean = true )

-- Also consider restricting which columns anonymous users can set (e.g., cannot set status other than 'requested').
