-- =============================================
-- FizouTV Migration: Add profile fields
-- Execute this in Supabase SQL Editor
-- =============================================

-- Add new columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS sex TEXT CHECK (sex IN ('homme', 'femme', 'autre')),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Update the trigger to include new fields from signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role, nationality, sex, date_of_birth)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'user',
    NEW.raw_user_meta_data->>'nationality',
    NEW.raw_user_meta_data->>'sex',
    (NEW.raw_user_meta_data->>'date_of_birth')::DATE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
