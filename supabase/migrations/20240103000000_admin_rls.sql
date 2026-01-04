-- Allow admins to see their own administrative record
create policy "Admins can see own record" on public.admins
  for select using (auth.uid() = id);

-- No update/insert/delete via regular client for now, must be done via Dashboard or SQL console
