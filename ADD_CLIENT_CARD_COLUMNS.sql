-- Client card persistence: Stage / Notes
-- These fields are shown on a client's card (a client without a project yet).
-- They live on `projects`, but a bare client card has no project row to save to,
-- so we mirror them onto the clients table. Run this in the Supabase SQL Editor.

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS pipeline_stage  text,
  ADD COLUMN IF NOT EXISTS internal_notes  text;
