-- Add scheduled_for column to polls table
ALTER TABLE public.polls 
ADD COLUMN IF NOT EXISTS scheduled_for DATE;

-- Add unique index to ensure only one poll per day
-- We filter where scheduled_for is NOT NULL to allow multiple unscheduled drafts if needed, 
-- though the requirement implies we want to schedule them.
CREATE UNIQUE INDEX IF NOT EXISTS polls_scheduled_for_key 
ON public.polls (scheduled_for) 
WHERE scheduled_for IS NOT NULL;
