-- Add profile_data column to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT '{}';
