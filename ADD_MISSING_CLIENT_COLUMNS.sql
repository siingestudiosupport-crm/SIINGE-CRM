-- Add missing columns to clients table
-- Run this in Supabase SQL Editor if you get schema cache errors

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS investment_level text,
  ADD COLUMN IF NOT EXISTS brand_stage text,
  ADD COLUMN IF NOT EXISTS development_timeline text,
  ADD COLUMN IF NOT EXISTS support_level text,
  ADD COLUMN IF NOT EXISTS primary_issue text,
  ADD COLUMN IF NOT EXISTS client_tier text,
  ADD COLUMN IF NOT EXISTS nda_status text DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS nda_sent_date date,
  ADD COLUMN IF NOT EXISTS nda_signed_date date,
  ADD COLUMN IF NOT EXISTS nda_signature text,
  ADD COLUMN IF NOT EXISTS nda_pdf_path text,
  ADD COLUMN IF NOT EXISTS nda_client_name text,
  ADD COLUMN IF NOT EXISTS nda_client_title text,
  ADD COLUMN IF NOT EXISTS nda_opened_at timestamp,
  ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();
