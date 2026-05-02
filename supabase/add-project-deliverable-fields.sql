-- Add missing deliverable fields to the projects table
-- Run this with Supabase CLI or directly in the Supabase SQL editor.

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS deliverable_trend_analysis boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deliverable_trend_analysis_due date,
  ADD COLUMN IF NOT EXISTS deliverable_design boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deliverable_design_due date,
  ADD COLUMN IF NOT EXISTS deliverable_tech_pack boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deliverable_tech_pack_due date,
  ADD COLUMN IF NOT EXISTS deliverable_product_analysis boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deliverable_product_analysis_due date,
  ADD COLUMN IF NOT EXISTS deliverable_product_dev boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deliverable_manu_quotes_due date,
  ADD COLUMN IF NOT EXISTS deliverable_initial_sample_due date,
  ADD COLUMN IF NOT EXISTS deliverable_approved_sample_due date,
  ADD COLUMN IF NOT EXISTS deliverable_size_range_due date,
  ADD COLUMN IF NOT EXISTS deliverable_bulk_due date,
  ADD COLUMN IF NOT EXISTS deliverable_branding boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deliverable_branding_due date,
  ADD COLUMN IF NOT EXISTS deliverable_in_house_patternmaking boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deliverable_in_house_patternmaking_due date,
  ADD COLUMN IF NOT EXISTS deliverable_in_house_proto boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deliverable_in_house_proto_due date,
  ADD COLUMN IF NOT EXISTS deliverable_in_house_manufacturing boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deliverable_in_house_manufacturing_due date;
