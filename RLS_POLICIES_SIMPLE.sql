-- ============================================
-- ROW LEVEL SECURITY (RLS) - VERSIÓN SIMPLE
-- ============================================
-- Ejecuta DESPUÉS de las migraciones de tokens y rate limiting
-- Si una tabla no existe, Supabase mostrará warning pero continuará

-- ============================================
-- 1. CLIENTS TABLE
-- ============================================
BEGIN;
ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view all clients" ON clients;
CREATE POLICY "Team can view all clients" ON clients
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Team can insert clients" ON clients;
CREATE POLICY "Team can insert clients" ON clients
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Team can update clients" ON clients;
CREATE POLICY "Team can update clients" ON clients
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Team can delete clients" ON clients;
CREATE POLICY "Team can delete clients" ON clients
  FOR DELETE
  USING (auth.role() = 'authenticated');
COMMIT;

-- ============================================
-- 2. PROJECTS TABLE
-- ============================================
BEGIN;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view all projects" ON projects;
CREATE POLICY "Team can view all projects" ON projects
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Team can insert projects" ON projects;
CREATE POLICY "Team can insert projects" ON projects
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Team can update projects" ON projects;
CREATE POLICY "Team can update projects" ON projects
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Team can delete projects" ON projects;
CREATE POLICY "Team can delete projects" ON projects
  FOR DELETE
  USING (auth.role() = 'authenticated');
COMMIT;

-- ============================================
-- 3. PORTAL_ACCESS_TOKENS
-- ============================================
BEGIN;
ALTER TABLE IF EXISTS portal_access_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can validate tokens" ON portal_access_tokens;
CREATE POLICY "Public can validate tokens" ON portal_access_tokens
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Team can create tokens" ON portal_access_tokens;
CREATE POLICY "Team can create tokens" ON portal_access_tokens
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Team can update tokens" ON portal_access_tokens;
CREATE POLICY "Team can update tokens" ON portal_access_tokens
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Team can view token history" ON portal_access_tokens;
CREATE POLICY "Team can view token history" ON portal_access_tokens
  FOR SELECT
  USING (auth.role() = 'authenticated');
COMMIT;

-- ============================================
-- 4. PORTAL_REQUEST_LOGS
-- ============================================
BEGIN;
ALTER TABLE IF EXISTS portal_request_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can log portal access" ON portal_request_logs;
CREATE POLICY "Public can log portal access" ON portal_request_logs
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read access logs for rate limiting" ON portal_request_logs;
CREATE POLICY "Public can read access logs for rate limiting" ON portal_request_logs
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Team can view all access logs" ON portal_request_logs;
CREATE POLICY "Team can view all access logs" ON portal_request_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');
COMMIT;

-- ============================================
-- 5. ACTIVITY_LOGS (si existe)
-- ============================================
BEGIN;
ALTER TABLE IF EXISTS activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view activity logs" ON activity_logs;
CREATE POLICY "Team can view activity logs" ON activity_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Team can insert activity logs" ON activity_logs;
CREATE POLICY "Team can insert activity logs" ON activity_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
COMMIT;

-- ============================================
-- 6. EMAIL_QUEUE (si existe)
-- ============================================
BEGIN;
ALTER TABLE IF EXISTS email_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view email queue" ON email_queue;
CREATE POLICY "Team can view email queue" ON email_queue
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Team can insert to email queue" ON email_queue;
CREATE POLICY "Team can insert to email queue" ON email_queue
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Team can update email queue" ON email_queue;
CREATE POLICY "Team can update email queue" ON email_queue
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
COMMIT;

-- ============================================
-- 7. EMAIL_TEMPLATES (si existe)
-- ============================================
BEGIN;
ALTER TABLE IF EXISTS email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "App can read email templates" ON email_templates;
CREATE POLICY "App can read email templates" ON email_templates
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Team can manage email templates" ON email_templates;
CREATE POLICY "Team can manage email templates" ON email_templates
  FOR ALL
  USING (auth.role() = 'authenticated');
COMMIT;

-- ============================================
-- LISTO
-- ============================================
-- RLS está configurado
-- Prueba: SELECT * FROM clients; (debería fallar si no autenticado)
