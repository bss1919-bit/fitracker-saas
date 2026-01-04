-- RLS Policies for program_assignments

create policy "Coaches can see own assignments" on public.program_assignments
  using (
    exists (
      select 1 from public.coach_programs
      where coach_programs.id = program_assignments.program_id
      and coach_programs.coach_id = auth.uid()
    )
  );

create policy "Coaches can insert assignments for their programs" on public.program_assignments
  for insert with check (
    exists (
      select 1 from public.coach_programs
      where coach_programs.id = program_assignments.program_id
      and coach_programs.coach_id = auth.uid()
    )
  );

create policy "Coaches can update own assignments" on public.program_assignments
  for update using (
    exists (
      select 1 from public.coach_programs
      where coach_programs.id = program_assignments.program_id
      and coach_programs.coach_id = auth.uid()
    )
  );

create policy "Coaches can delete own assignments" on public.program_assignments
  for delete using (
    exists (
      select 1 from public.coach_programs
      where coach_programs.id = program_assignments.program_id
      and coach_programs.coach_id = auth.uid()
    )
  );
