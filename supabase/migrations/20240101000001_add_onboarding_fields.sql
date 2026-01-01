alter table public.coaches 
add column if not exists logo_url text,
add column if not exists specialties text[],
add column if not exists website text,
add column if not exists onboarding_completed boolean default false;
