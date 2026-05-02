-- Rate limiting table for backend protection
CREATE TABLE IF NOT EXISTS portal_request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_ip inet NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  endpoint text NOT NULL,
  status_code int,
  created_at timestamptz DEFAULT now()
);

-- Indexes for efficient rate limit checks
CREATE INDEX idx_request_logs_ip_time ON portal_request_logs(client_ip, created_at DESC);
CREATE INDEX idx_request_logs_client_time ON portal_request_logs(client_id, created_at DESC);
CREATE INDEX idx_request_logs_created ON portal_request_logs(created_at DESC);

-- Function to check rate limits (signature routes lenient, others strict)
CREATE OR REPLACE FUNCTION check_portal_rate_limit(
  ip inet,
  doc_type text,
  max_requests int DEFAULT 50,
  window_minutes int DEFAULT 60
) RETURNS TABLE(allowed boolean, requests_count bigint, window_ms bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (COUNT(*) < max_requests)::boolean as allowed,
    COUNT(*)::bigint as requests_count,
    (window_minutes * 60000)::bigint as window_ms
  FROM portal_request_logs
  WHERE
    client_ip = ip
    AND created_at > now() - INTERVAL '1 minute' * window_minutes;
END;
$$ LANGUAGE plpgsql;

-- Function to log portal access attempt
CREATE OR REPLACE FUNCTION log_portal_access(
  ip inet,
  cid uuid,
  doc_type text,
  endpoint text,
  code int
) RETURNS void AS $$
BEGIN
  INSERT INTO portal_request_logs (client_ip, client_id, document_type, endpoint, status_code)
  VALUES (ip, cid, doc_type, endpoint, code);
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE portal_request_logs ENABLE ROW LEVEL SECURITY;

-- Allow application to read rate limit data
CREATE POLICY "Allow app to read logs for rate limiting" ON portal_request_logs
  FOR SELECT
  USING (true);

-- Allow application to insert logs
CREATE POLICY "Allow app to insert access logs" ON portal_request_logs
  FOR INSERT
  WITH CHECK (true);
