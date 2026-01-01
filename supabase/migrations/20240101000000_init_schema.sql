-- RLS on auth.users is usually managed by Supabase, skipping explicit enable to avoid permission errors


-- 1. USERS & COACHES
create table public.coaches (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  business_name text,
  subscription_tier text default 'free', 
  settings jsonb default '{}',
  created_at timestamptz default now()
);
alter table public.coaches enable row level security;

-- 1.1 SUPER ADMINS
create table public.admins (
  id uuid references auth.users not null primary key,
  email text not null,
  role text default 'super_admin',
  created_at timestamptz default now()
);
alter table public.admins enable row level security;

-- 2. CLIENTS
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references public.coaches not null,
  mobile_user_id uuid,
  first_name text not null,
  last_name text,
  email text,
  status text default 'active',
  notes text,
  created_at timestamptz default now()
);
alter table public.clients enable row level security;

-- 3. SYNCED DATA
create table public.synced_data (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients not null,
  data_type text not null, 
  mobile_object_id text not null,
  payload jsonb not null, 
  performed_at timestamptz,
  tags text[], 
  updated_at timestamptz default now(),
  unique(client_id, data_type, mobile_object_id)
);
alter table public.synced_data enable row level security;

-- 4. COACH LIBRARY
create table public.coach_exercises (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references public.coaches not null,
  name jsonb not null,
  instructions jsonb,
  video_url text,
  category text,
  created_at timestamptz default now()
);
alter table public.coach_exercises enable row level security;

-- 5. PROGRAMS
create table public.coach_programs (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references public.coaches not null,
  name jsonb not null,
  description jsonb,
  structure jsonb not null,
  is_template boolean default false,
  created_at timestamptz default now()
);
alter table public.coach_programs enable row level security;

create table public.program_assignments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.coach_programs not null,
  client_id uuid references public.clients not null,
  status text default 'active',
  start_date date,
  created_at timestamptz default now()
);
alter table public.program_assignments enable row level security;

-- INDEXES
CREATE INDEX idx_synced_client_type ON synced_data (client_id, data_type);
CREATE INDEX idx_payload_gin ON synced_data USING gin (payload);

-- RLS POLICIES (Basic Draft - Will be refined)

-- Coaches can read/write their own profile
create policy "Coaches can see own profile" on public.coaches
  using (auth.uid() = id);

create policy "Coaches can update own profile" on public.coaches
  for update using (auth.uid() = id);

-- Clients: Coaches can only see their own clients
create policy "Coaches can see own clients" on public.clients
  using (auth.uid() = coach_id);

create policy "Coaches can insert clients" on public.clients
  for insert with check (auth.uid() = coach_id);

create policy "Coaches can update own clients" on public.clients
  for update using (auth.uid() = coach_id);

-- Synced Data: Cascade from Clients
create policy "Coaches see synced data of their clients" on public.synced_data
  using (
    exists (
      select 1 from public.clients
      where clients.id = synced_data.client_id
      and clients.coach_id = auth.uid()
    )
  );
