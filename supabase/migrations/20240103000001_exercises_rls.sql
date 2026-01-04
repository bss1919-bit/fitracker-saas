-- RLS Policies for coach_exercises

create policy "Coaches can see own exercises" on public.coach_exercises
  for select using (auth.uid() = coach_id);

create policy "Coaches can insert own exercises" on public.coach_exercises
  for insert with check (auth.uid() = coach_id);

create policy "Coaches can update own exercises" on public.coach_exercises
  for update using (auth.uid() = coach_id);

create policy "Coaches can delete own exercises" on public.coach_exercises
  for delete using (auth.uid() = coach_id);
