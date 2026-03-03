-- ==============================================
-- Fix: Allow anyone (logged in or not) to view poll votes
-- This enables public display of poll results
-- ==============================================

-- Allow public SELECT on poll_votes so results are visible to everyone
CREATE POLICY "Anyone can view poll votes"
  ON public.poll_votes FOR SELECT USING (true);
