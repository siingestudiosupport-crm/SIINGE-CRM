-- Add deal not closed fields to the projects table
-- Run this with Supabase CLI or directly in the Supabase SQL editor.

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS deal_not_closed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deal_not_closed_reasons text,
  ADD COLUMN IF NOT EXISTS deal_not_closed_notes text;
