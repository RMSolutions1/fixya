-- FixYa — PostgreSQL extensions and utility functions
-- Run after Prisma migrate deploy

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Tenant context for RLS (set by NestJS middleware per request)
-- Usage: SELECT set_config('app.current_tenant_id', '{uuid}', true);

CREATE OR REPLACE FUNCTION fixya_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION fixya_is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(current_setting('app.is_super_admin', true), 'false') = 'true';
EXCEPTION
  WHEN OTHERS THEN RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION fixya_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ledger balance validation: sum(debit) must equal sum(credit) per entry
CREATE OR REPLACE FUNCTION fixya_validate_ledger_balance()
RETURNS TRIGGER AS $$
DECLARE
  total_debit  NUMERIC(18,2);
  total_credit NUMERIC(18,2);
BEGIN
  SELECT COALESCE(SUM(debit), 0), COALESCE(SUM(credit), 0)
  INTO total_debit, total_credit
  FROM ledger_lines
  WHERE ledger_entry_id = NEW.ledger_entry_id;

  IF total_debit <> total_credit THEN
    RAISE EXCEPTION 'Ledger entry % unbalanced: debit=% credit=%',
      NEW.ledger_entry_id, total_debit, total_credit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequential entry number per tenant per month
CREATE OR REPLACE FUNCTION fixya_generate_entry_number(p_tenant_id UUID)
RETURNS VARCHAR(30) AS $$
DECLARE
  v_prefix VARCHAR(10);
  v_seq    INT;
BEGIN
  v_prefix := TO_CHAR(NOW(), 'YYYYMM');
  SELECT COUNT(*) + 1 INTO v_seq
  FROM ledger_entries
  WHERE tenant_id = p_tenant_id
    AND TO_CHAR(posted_at, 'YYYYMM') = v_prefix;

  RETURN v_prefix || '-' || LPAD(v_seq::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
