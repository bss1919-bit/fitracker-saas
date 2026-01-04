alter table public.coaches 
add column if not exists status text default 'active';

-- Update RLS if needed. 
-- For now, if a coach is suspended or banned, we might want to prevent them from logging in via Middleware or RLS.
-- Let's add an RLS policy that prevents updates if banned.
create policy "Banned coaches cannot update profile" on public.coaches
  for update using (auth.uid() = id and status != 'banned');
