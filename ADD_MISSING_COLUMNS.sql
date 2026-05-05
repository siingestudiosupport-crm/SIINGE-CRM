-- Add missing columns to projects table
-- Run this in Supabase SQL Editor if you get schema cache errors

-- Check existing columns first with:
-- SELECT column_name FROM information_schema.columns WHERE table_name='projects';

-- Add columns used in ProjectDetail.vue
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS review_requested boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS loss_reason text,
  ADD COLUMN IF NOT EXISTS deal_not_closed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deal_not_closed_notes text,
  ADD COLUMN IF NOT EXISTS deal_not_closed_reasons text,
  ADD COLUMN IF NOT EXISTS amount_owed numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scheduled_date timestamp,
  ADD COLUMN IF NOT EXISTS snooze_until timestamp,
  ADD COLUMN IF NOT EXISTS manual_sow_date boolean DEFAULT false;

-- Add columns used in ClientPortal.vue for SOW
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS sow_deliverables text,
  ADD COLUMN IF NOT EXISTS sow_timeline text,
  ADD COLUMN IF NOT EXISTS sow_fees_payment text,
  ADD COLUMN IF NOT EXISTS sow_sent_date date,
  ADD COLUMN IF NOT EXISTS sow_signed_date date,
  ADD COLUMN IF NOT EXISTS sow_signature text,
  ADD COLUMN IF NOT EXISTS sow_pdf_path text,
  ADD COLUMN IF NOT EXISTS sow_status text DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS sow_client_name text,
  ADD COLUMN IF NOT EXISTS sow_client_title text,
  ADD COLUMN IF NOT EXISTS sow_opened_at timestamp;

-- Add additional columns that might be used elsewhere
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS proposal_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS client_id bigint,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();
