-- FixYa — Row Level Security policies
-- SUPER_ADMIN bypass via app.is_super_admin = 'true'

-- ============================================================================
-- Enable RLS on tenant-scoped tables
-- ============================================================================

ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner (application role)
ALTER TABLE engagements FORCE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;
ALTER TABLE wallet_accounts FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- Policy template: tenant isolation with super admin bypass
-- ============================================================================

-- ENGAGEMENTS
DROP POLICY IF EXISTS engagements_tenant_isolation ON engagements;
CREATE POLICY engagements_tenant_isolation ON engagements
  FOR ALL
  USING (
    fixya_is_super_admin()
    OR tenant_id = fixya_current_tenant_id()
  )
  WITH CHECK (
    fixya_is_super_admin()
    OR tenant_id = fixya_current_tenant_id()
  );

-- PAYMENTS
DROP POLICY IF EXISTS payments_tenant_isolation ON payments;
CREATE POLICY payments_tenant_isolation ON payments
  FOR ALL
  USING (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id())
  WITH CHECK (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id());

-- WALLET
DROP POLICY IF EXISTS wallet_accounts_tenant_isolation ON wallet_accounts;
CREATE POLICY wallet_accounts_tenant_isolation ON wallet_accounts
  FOR ALL
  USING (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id())
  WITH CHECK (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id());

DROP POLICY IF EXISTS ledger_entries_tenant_isolation ON ledger_entries;
CREATE POLICY ledger_entries_tenant_isolation ON ledger_entries
  FOR ALL
  USING (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id())
  WITH CHECK (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id());

-- FISCAL
DROP POLICY IF EXISTS fiscal_documents_tenant_isolation ON fiscal_documents;
CREATE POLICY fiscal_documents_tenant_isolation ON fiscal_documents
  FOR ALL
  USING (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id())
  WITH CHECK (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id());

-- DOCUMENTS
DROP POLICY IF EXISTS documents_tenant_isolation ON documents;
CREATE POLICY documents_tenant_isolation ON documents
  FOR ALL
  USING (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id())
  WITH CHECK (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id());

-- PROJECTS
DROP POLICY IF EXISTS projects_tenant_isolation ON projects;
CREATE POLICY projects_tenant_isolation ON projects
  FOR ALL
  USING (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id())
  WITH CHECK (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id());

-- CRM
DROP POLICY IF EXISTS crm_clients_tenant_isolation ON crm_clients;
CREATE POLICY crm_clients_tenant_isolation ON crm_clients
  FOR ALL
  USING (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id())
  WITH CHECK (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id());

-- SERVICES / MARKETPLACE
DROP POLICY IF EXISTS services_tenant_isolation ON services;
CREATE POLICY services_tenant_isolation ON services
  FOR ALL
  USING (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id())
  WITH CHECK (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id());

-- QUOTATIONS
DROP POLICY IF EXISTS quotations_tenant_isolation ON quotations;
CREATE POLICY quotations_tenant_isolation ON quotations
  FOR ALL
  USING (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id())
  WITH CHECK (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id());

-- COMPLIANCE
DROP POLICY IF EXISTS compliance_documents_tenant_isolation ON compliance_documents;
CREATE POLICY compliance_documents_tenant_isolation ON compliance_documents
  FOR ALL
  USING (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id())
  WITH CHECK (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id());

-- CHAT
DROP POLICY IF EXISTS chat_conversations_tenant_isolation ON chat_conversations;
CREATE POLICY chat_conversations_tenant_isolation ON chat_conversations
  FOR ALL
  USING (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id())
  WITH CHECK (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id());

-- OUTBOX
DROP POLICY IF EXISTS outbox_events_tenant_isolation ON outbox_events;
CREATE POLICY outbox_events_tenant_isolation ON outbox_events
  FOR ALL
  USING (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id())
  WITH CHECK (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id());

-- AUDIT (read-only for tenants; writes via triggers)
DROP POLICY IF EXISTS audit_logs_tenant_read ON audit_logs;
CREATE POLICY audit_logs_tenant_read ON audit_logs
  FOR SELECT
  USING (fixya_is_super_admin() OR tenant_id = fixya_current_tenant_id() OR tenant_id IS NULL);

-- Application roles
-- fixya_app: SET ROLE fixya_app before queries (RLS enforced)
-- fixya_migration: BYPASSRLS for migrations only
