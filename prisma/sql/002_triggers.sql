-- FixYa — Database triggers
-- Immutability, audit, validation

-- ============================================================================
-- updated_at triggers (representative tables; extend as needed)
-- ============================================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'tenants', 'users', 'tenant_members', 'services', 'service_requests',
    'quotations', 'engagements', 'documents', 'payments', 'wallet_accounts',
    'projects', 'tasks', 'crm_clients', 'crm_opportunities', 'compliance_documents',
    'fiscal_documents', 'chat_conversations'
  ])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I;
      CREATE TRIGGER trg_%s_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION fixya_set_updated_at();
    ', t, t, t, t);
  END LOOP;
END $$;

-- ============================================================================
-- Wallet: prevent UPDATE/DELETE on ledger (immutability)
-- ============================================================================

CREATE OR REPLACE FUNCTION fixya_prevent_ledger_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'ledger_entries and ledger_lines are immutable. Use adjustment entries.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ledger_entries_no_update ON ledger_entries;
CREATE TRIGGER trg_ledger_entries_no_update
  BEFORE UPDATE OR DELETE ON ledger_entries
  FOR EACH ROW EXECUTE FUNCTION fixya_prevent_ledger_mutation();

DROP TRIGGER IF EXISTS trg_ledger_lines_no_update ON ledger_lines;
CREATE TRIGGER trg_ledger_lines_no_update
  BEFORE UPDATE OR DELETE ON ledger_lines
  FOR EACH ROW EXECUTE FUNCTION fixya_prevent_ledger_mutation();

-- Balance check after line insert (deferred per statement)
CREATE OR REPLACE FUNCTION fixya_check_ledger_balance_stmt()
RETURNS TRIGGER AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT le.id,
           COALESCE(SUM(ll.debit), 0) AS d,
           COALESCE(SUM(ll.credit), 0) AS c
    FROM ledger_entries le
    JOIN ledger_lines ll ON ll.ledger_entry_id = le.id
    WHERE le.id IN (SELECT DISTINCT ledger_entry_id FROM new_lines)
    GROUP BY le.id
  LOOP
    IF r.d <> r.c THEN
      RAISE EXCEPTION 'Unbalanced ledger entry: %', r.id;
    END IF;
  END LOOP;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Wallet events: auto-increment sequence per account
-- ============================================================================

CREATE OR REPLACE FUNCTION fixya_wallet_event_sequence()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sequence IS NULL OR NEW.sequence = 0 THEN
    SELECT COALESCE(MAX(sequence), 0) + 1 INTO NEW.sequence
    FROM wallet_events
    WHERE wallet_account_id = NEW.wallet_account_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_wallet_events_sequence ON wallet_events;
CREATE TRIGGER trg_wallet_events_sequence
  BEFORE INSERT ON wallet_events
  FOR EACH ROW EXECUTE FUNCTION fixya_wallet_event_sequence();

-- ============================================================================
-- Audit log trigger (generic for critical tables)
-- ============================================================================

CREATE OR REPLACE FUNCTION fixya_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_user_id   UUID;
  v_old       JSONB;
  v_new       JSONB;
BEGIN
  v_tenant_id := fixya_current_tenant_id();
  BEGIN
    v_user_id := NULLIF(current_setting('app.current_user_id', true), '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
    INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, old_values, created_at)
    VALUES (gen_random_uuid(), v_tenant_id, v_user_id, 'DELETE', TG_TABLE_NAME, OLD.id, v_old, NOW());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, old_values, new_values, created_at)
    VALUES (gen_random_uuid(), v_tenant_id, v_user_id, 'UPDATE', TG_TABLE_NAME, NEW.id, v_old, v_new, NOW());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    v_new := to_jsonb(NEW);
    INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, new_values, created_at)
    VALUES (gen_random_uuid(), v_tenant_id, v_user_id, 'CREATE', TG_TABLE_NAME, NEW.id, v_new, NOW());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'engagements', 'payments', 'wallet_accounts', 'fiscal_documents', 'disputes'
  ])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_%s_audit ON %I;
      CREATE TRIGGER trg_%s_audit
        AFTER INSERT OR UPDATE OR DELETE ON %I
        FOR EACH ROW EXECUTE FUNCTION fixya_audit_trigger();
    ', t, t, t, t);
  END LOOP;
END $$;

-- ============================================================================
-- Soft delete filter helper view (optional)
-- ============================================================================

-- Active records: WHERE deleted_at IS NULL (enforced at application layer + partial indexes)
