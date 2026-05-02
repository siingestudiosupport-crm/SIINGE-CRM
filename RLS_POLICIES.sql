-- ============================================
-- ROW LEVEL SECURITY (RLS) - CRITICAL SECURITY
-- ============================================
-- Este SQL implementa Row Level Security en todas las tablas sensibles
-- Ejecuta esto en Supabase → SQL Editor
-- IMPORTANTE: Verifica que funciona antes de dejarlo en producción

-- ============================================
-- 1. CLIENTS TABLE - Datos de clientes
-- ============================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Team can view all clients
CREATE POLICY "Team can view all clients" ON clients
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Portal users can view a client only with valid portal token
CREATE POLICY "Portal users can view client with valid token" ON clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portal_access_tokens
      WHERE client_id = clients.id
      AND is_used = false
      AND expires_at > now()
    )
  );

-- Team can insert clients
CREATE POLICY "Team can insert clients" ON clients
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Team can update clients
CREATE POLICY "Team can update clients" ON clients
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Portal users can update client with valid token
CREATE POLICY "Portal users can update client with valid token" ON clients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portal_access_tokens
      WHERE client_id = clients.id
      AND is_used = false
      AND expires_at > now()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_access_tokens
      WHERE client_id = clients.id
      AND is_used = false
      AND expires_at > now()
    )
  );

-- Team can delete clients
CREATE POLICY "Team can delete clients" ON clients
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 2. PROJECTS TABLE - Proyectos/deals
-- ============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Team can view all projects
CREATE POLICY "Team can view all projects" ON projects
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Portal users can view a project only with valid SOW token
CREATE POLICY "Portal users can view project with valid SOW token" ON projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portal_access_tokens
      WHERE project_id = projects.id
      AND document_type = 'sow'
      AND is_used = false
      AND expires_at > now()
    )
  );

-- Team can insert projects
CREATE POLICY "Team can insert projects" ON projects
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Team can update projects
CREATE POLICY "Team can update projects" ON projects
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Portal users can update project with valid SOW token
CREATE POLICY "Portal users can update project with valid SOW token" ON projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portal_access_tokens
      WHERE project_id = projects.id
      AND document_type = 'sow'
      AND is_used = false
      AND expires_at > now()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_access_tokens
      WHERE project_id = projects.id
      AND document_type = 'sow'
      AND is_used = false
      AND expires_at > now()
    )
  );

-- Team can delete projects
CREATE POLICY "Team can delete projects" ON projects
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 3. PORTAL_ACCESS_TOKENS - Tokens para firmas
-- ============================================
ALTER TABLE portal_access_tokens ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Only team can read tokens. Portal users use edge function with service_role key.
-- This prevents enumeration of all tokens and unauthorized access.
CREATE POLICY "Team can view all tokens" ON portal_access_tokens
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Team can create tokens
CREATE POLICY "Team can create tokens" ON portal_access_tokens
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Team can update tokens (mark as used)
CREATE POLICY "Team can update tokens" ON portal_access_tokens
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 4. PORTAL_REQUEST_LOGS - Logs de acceso al portal
-- ============================================
ALTER TABLE portal_request_logs ENABLE ROW LEVEL SECURITY;

-- Public can log portal access (needed for rate limiting)
CREATE POLICY "Public can log portal access" ON portal_request_logs
  FOR INSERT
  WITH CHECK (true);

-- CRITICAL: Only team can read logs. Portal rate limiting is enforced server-side.
-- This prevents enumeration of access patterns and client activity.
CREATE POLICY "Team can view all access logs" ON portal_request_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- 5. ACTIVITY_LOGS - Historial de acciones
-- ============================================
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Team can view activity logs
CREATE POLICY "Team can view activity logs" ON activity_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Team can insert activity logs
CREATE POLICY "Team can insert activity logs" ON activity_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 6. EMAIL_QUEUE - Cola de emails
-- ============================================
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Team can view email queue
CREATE POLICY "Team can view email queue" ON email_queue
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Team can insert to email queue
CREATE POLICY "Team can insert to email queue" ON email_queue
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Team can update email queue
CREATE POLICY "Team can update email queue" ON email_queue
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 7. EMAIL_TEMPLATES - Plantillas de email
-- ============================================
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can read email templates (for server-side rendering)
CREATE POLICY "App can read email templates" ON email_templates
  FOR SELECT
  USING (true);

-- Team can insert email templates
CREATE POLICY "Team can insert email templates" ON email_templates
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Team can update email templates
CREATE POLICY "Team can update email templates" ON email_templates
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Team can delete email templates
CREATE POLICY "Team can delete email templates" ON email_templates
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- VERIFICACIÓN - Ejecuta estas queries después
-- ============================================

-- Ver qué tablas tienen RLS habilitado:
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- Ver todas las políticas:
-- SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Test: Intenta acceder como anónimo (debería fallar):
-- SELECT * FROM clients; -- Debería retornar "row-level security" error

-- Test: Como autenticado (debería funcionar):
-- (Necesitas estar logged in como usuario de tu equipo)
-- SELECT * FROM clients; -- Debería retornar datos
