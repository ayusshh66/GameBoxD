-- Execute against the same Neon DB/branch used by your backend.
-- Use this SQL OR a verified Drizzle migration, not both.
CREATE TABLE IF NOT EXISTS public.review_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS review_replies_review_created_idx
  ON public.review_replies (review_id, created_at);
