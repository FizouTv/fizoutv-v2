-- =============================================
-- 007: Authors table (independent from auth.users)
-- Allows creating authors who are not necessarily
-- registered users of the platform.
-- =============================================

-- Create authors table
CREATE TABLE IF NOT EXISTS public.authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- Everyone can see authors
CREATE POLICY "Authors are viewable by everyone"
  ON public.authors FOR SELECT USING (true);

-- Admins can manage authors
CREATE POLICY "Admins can manage authors"
  ON public.authors FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed: copy existing admin profiles into the authors table
INSERT INTO public.authors (id, display_name, avatar_url)
SELECT id, COALESCE(display_name, 'Sans nom'), avatar_url
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (id) DO NOTHING;

-- Update articles FK: switch from profiles to authors
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_author_id_fkey;
ALTER TABLE public.articles ADD CONSTRAINT articles_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE SET NULL;
