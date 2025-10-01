-- Migration: Add OpenOrder table
CREATE TABLE "OpenOrder" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "customer" text,
  "items" text NOT NULL,
  "total" numeric NOT NULL,
  "status" text NOT NULL DEFAULT 'open'
);
