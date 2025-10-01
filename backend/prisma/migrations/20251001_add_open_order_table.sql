-- Tabel open_orders untuk migrasi data open order ke backend
CREATE TABLE IF NOT EXISTS open_orders (
  id BIGINT PRIMARY KEY,
  customer VARCHAR(255),
  items JSONB,
  notes TEXT,
  diskon VARCHAR(50),
  promo VARCHAR(100),
  createdAt TIMESTAMP,
  status VARCHAR(20)
);
-- Migration: Add OpenOrder table
CREATE TABLE "OpenOrder" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "customer" text,
  "items" text NOT NULL,
  "total" numeric NOT NULL,
  "status" text NOT NULL DEFAULT 'open'
);
