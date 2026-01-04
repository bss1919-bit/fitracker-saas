-- RLS Policies for coach_programs

create policy "Coaches can see own programs" on public.coach_programs
  for select using (auth.uid() = coach_id);

create policy "Coaches can insert own programs" on public.coach_programs
  for insert with check (auth.uid() = coach_id);

create policy "Coaches can update own programs" on public.coach_programs
  for update using (auth.uid() = coach_id);

create policy "Coaches can delete own programs" on public.coach_programs
  for delete using (auth.uid() = coach_id);
