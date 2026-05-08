-- ============================================================
-- NexArtWO — Work Orders Project Link
-- Migration: 202605070003_work_orders_project_id.sql
-- Purpose: Add a real nullable Project relationship to Work Orders
-- Safety: Does not modify existing data. Does not remove property snapshot.
-- Approved by: Owner (Rodolfo Fernandez Romero) — Phase A only
-- Date: 2026-05-07
-- ============================================================

-- Add project_id column to work_orders only if it does not already exist.
-- Type TEXT matches projects.id (TEXT PRIMARY KEY, e.g., 'PROJ-2026-1000').
-- Nullable so existing work orders without a project are not broken.
-- ON DELETE SET NULL ensures work orders survive project deletion gracefully.
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS project_id TEXT REFERENCES projects(id) ON DELETE SET NULL;

-- Index for efficient lookups when querying work orders by project.
CREATE INDEX IF NOT EXISTS idx_work_orders_project_id
ON work_orders(project_id);
