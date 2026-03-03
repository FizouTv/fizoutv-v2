-- =============================================
-- FizouTV Migration: Newsletter scheduling
-- Execute this in Supabase SQL Editor
-- =============================================

-- Add scheduling and status columns to newsletters
ALTER TABLE public.newsletters
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent'));

-- Update existing sent newsletters to have correct status
UPDATE public.newsletters SET status = 'sent' WHERE sent_at IS NOT NULL;
UPDATE public.newsletters SET status = 'draft' WHERE sent_at IS NULL;
