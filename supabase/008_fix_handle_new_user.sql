-- =============================================
-- FizouTV Fix: Robust handle_new_user trigger
-- Execute this in Supabase SQL Editor
-- =============================================

-- 1. Ensure all required columns exist on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS sex TEXT CHECK (sex IN ('homme', 'femme', 'autre')),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 2. Replace trigger with a fault-tolerant version
--    Uses EXCEPTION to prevent auth signup from failing
--    if the profile insert encounters any issue.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_display_name TEXT;
  v_nationality TEXT;
  v_sex TEXT;
  v_dob DATE;
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  -- Extract values safely
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );
  v_nationality := NEW.raw_user_meta_data->>'nationality';
  v_first_name  := NEW.raw_user_meta_data->>'first_name';
  v_last_name   := NEW.raw_user_meta_data->>'last_name';

  -- Only use sex values that pass the CHECK constraint
  v_sex := CASE
    WHEN NEW.raw_user_meta_data->>'sex' IN ('homme', 'femme', 'autre')
    THEN NEW.raw_user_meta_data->>'sex'
    ELSE NULL
  END;

  -- Safely cast date (returns NULL if format is invalid)
  BEGIN
    v_dob := (NEW.raw_user_meta_data->>'date_of_birth')::DATE;
  EXCEPTION WHEN OTHERS THEN
    v_dob := NULL;
  END;

  -- Insert profile (never fail auth signup)
  BEGIN
    INSERT INTO public.profiles (
      id, display_name, role,
      nationality, sex, date_of_birth,
      first_name, last_name
    )
    VALUES (
      NEW.id,
      v_display_name,
      'user',
      v_nationality,
      v_sex,
      v_dob,
      v_first_name,
      v_last_name
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log but do not block signup
    RAISE WARNING 'handle_new_user: could not insert profile for user %. Error: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate the trigger (no-op if already exists, drop first to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
