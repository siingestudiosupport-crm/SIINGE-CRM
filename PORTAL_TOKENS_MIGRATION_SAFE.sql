-- Create portal_access_tokens table for secure time-limited document access
-- SAFE VERSION: No falla si ya existe

CREATE TABLE IF NOT EXISTS portal_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('sow', 'nda')),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  is_used boolean DEFAULT false,
  used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Index for fast token lookups (safe version)
CREATE INDEX IF NOT EXISTS idx_portal_tokens_token ON portal_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_portal_tokens_client_doc ON portal_access_tokens(client_id, document_type);
CREATE INDEX IF NOT EXISTS idx_portal_tokens_expires ON portal_access_tokens(expires_at);

-- Enable RLS on portal_access_tokens
ALTER TABLE portal_access_tokens ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (from previous attempts)
DROP POLICY IF EXISTS "Allow public token validation" ON portal_access_tokens;
DROP POLICY IF EXISTS "Allow authenticated to create tokens" ON portal_access_tokens;
DROP POLICY IF EXISTS "Allow authenticated to update tokens" ON portal_access_tokens;

-- Create new policies
CREATE POLICY "Allow public token validation" ON portal_access_tokens
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated to create tokens" ON portal_access_tokens
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated to update tokens" ON portal_access_tokens
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
