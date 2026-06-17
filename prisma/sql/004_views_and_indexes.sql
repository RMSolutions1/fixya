-- FixYa — Materialized views and supplemental indexes

-- ============================================================================
-- Full-text search index for services
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_services_title_trgm
  ON services USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_services_description_trgm
  ON services USING gin (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_service_requests_title_trgm
  ON service_requests USING gin (title gin_trgm_ops);

-- Partial indexes for soft delete (active records only)
CREATE INDEX IF NOT EXISTS idx_services_active
  ON services (tenant_id, status, category_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_engagements_active
  ON engagements (tenant_id, status, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_active
  ON users (email)
  WHERE deleted_at IS NULL;

-- Outbox worker polling
CREATE INDEX IF NOT EXISTS idx_outbox_pending
  ON outbox_events (created_at)
  WHERE status = 'PENDING';

-- MP webhook unprocessed
CREATE INDEX IF NOT EXISTS idx_mp_webhook_unprocessed
  ON mp_webhook_logs (created_at)
  WHERE processed = false;

-- Compliance expiring
CREATE INDEX IF NOT EXISTS idx_compliance_expiring
  ON compliance_documents (expires_at, status)
  WHERE deleted_at IS NULL AND status IN ('APPROVED', 'EXPIRING_SOON');

-- ============================================================================
-- Materialized view: engagement timeline (read model)
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_engagement_timeline AS
SELECT
  e.id AS engagement_id,
  e.tenant_id,
  e.status,
  et.event_type,
  et.actor_id,
  et.payload,
  et.created_at
FROM engagements e
JOIN engagement_timeline_events et ON et.engagement_id = e.id
ORDER BY et.created_at DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_engagement_timeline
  ON mv_engagement_timeline (engagement_id, created_at, event_type);

-- Refresh: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_engagement_timeline;
-- Triggered by worker on EngagementTimelineEvent insert

-- ============================================================================
-- Materialized view: wallet balance snapshot per tenant
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_wallet_tenant_summary AS
SELECT
  tenant_id,
  COUNT(*) AS account_count,
  SUM(held_amount) AS total_held,
  SUM(released_amount) AS total_released,
  SUM(commission_amount) AS total_commission,
  SUM(warranty_held) AS total_warranty_held,
  NOW() AS refreshed_at
FROM wallet_accounts
WHERE status = 'ACTIVE'
GROUP BY tenant_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_wallet_tenant_summary
  ON mv_wallet_tenant_summary (tenant_id);

-- ============================================================================
-- Materialized view: CRM pipeline summary
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_crm_pipeline_summary AS
SELECT
  o.tenant_id,
  s.id AS stage_id,
  s.name AS stage_name,
  s.sort_order,
  COUNT(o.id) AS opportunity_count,
  SUM(o.estimated_value) AS total_value,
  AVG(o.probability) AS avg_probability
FROM crm_opportunities o
JOIN crm_pipeline_stages s ON s.id = o.stage_id
WHERE o.deleted_at IS NULL AND o.status = 'OPEN'
GROUP BY o.tenant_id, s.id, s.name, s.sort_order;

CREATE INDEX IF NOT EXISTS idx_mv_crm_pipeline_tenant
  ON mv_crm_pipeline_summary (tenant_id, sort_order);

-- ============================================================================
-- Partitioning preparation (comment — execute when thresholds reached)
-- ============================================================================

-- audit_logs: PARTITION BY RANGE (created_at) — monthly
-- ledger_entries: PARTITION BY RANGE (posted_at) — monthly
-- chat_messages: PARTITION BY HASH (conversation_id) — 8 partitions
-- mp_webhook_logs: PARTITION BY RANGE (created_at) — weekly
