-- ─────────────────────────────────────────────────────────────────────────
-- arabiyya — Row Level Security policies
-- Run AFTER schema.sql
-- ─────────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
alter table jilids   enable row level security;
alter table units    enable row level security;
alter table materi   enable row level security;
alter table kamus    enable row level security;
alter table activity enable row level security;

-- PUBLIC: read-only (students can see content)
create policy "public read jilids"   on jilids   for select using (true);
create policy "public read units"    on units    for select using (true);
create policy "public read materi"   on materi   for select using (true);
create policy "public read kamus"    on kamus    for select using (true);

-- AUTHENTICATED (admin): full CRUD
create policy "admin write jilids"   on jilids   for all using (auth.role() = 'authenticated');
create policy "admin write units"    on units    for all using (auth.role() = 'authenticated');
create policy "admin write materi"   on materi   for all using (auth.role() = 'authenticated');
create policy "admin write kamus"    on kamus    for all using (auth.role() = 'authenticated');
create policy "admin write activity" on activity for all using (auth.role() = 'authenticated');
-- Activity is write-only for anon (no public read)
