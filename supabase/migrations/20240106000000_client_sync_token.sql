alter table public.clients 
add column if not exists sync_token text default gen_random_uuid()::text;

-- Ensure it's unique enough for basic auth
create index if not exists clients_sync_token_idx on public.clients(sync_token);
