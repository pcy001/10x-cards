-- 10xCards Database Schema for PostgreSQL

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (handled by Supabase Auth, this is just a representation)
-- The actual users table will be managed by Supabase Auth
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance when querying by user_id
CREATE INDEX idx_cards_user_id ON cards(user_id);

-- Unique index to prevent exact duplicates for the same user
-- This replaces the more complex similarity-based duplicate detection
CREATE UNIQUE INDEX idx_cards_user_front_back ON cards(user_id, md5(front), md5(back));

-- Card reviews (for spaced repetition)
-- Note: This structure is designed to be compatible with common open source
-- spaced repetition algorithms (like those used in Anki or SuperMemo)
CREATE TABLE IF NOT EXISTS card_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Rating of knowledge (1-4, where 1 = "Nie pamiętam", 4 = "Łatwe")
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 4),
  
  -- Next review date - will be calculated by the open source algorithm
  next_review_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Fields to support common SM-2/Anki-like algorithms
  ease_factor FLOAT DEFAULT 2.5,  -- The "easiness factor" used in SM-2
  interval_days INTEGER DEFAULT 1, -- Current interval in days
  
  -- Effectiveness of the answer (correct/incorrect)
  effective BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for card_reviews
CREATE INDEX idx_card_reviews_card_id ON card_reviews(card_id);
CREATE INDEX idx_card_reviews_user_id ON card_reviews(user_id);
CREATE INDEX idx_card_reviews_next_review_date ON card_reviews(next_review_date);

-- Study sessions
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  
  -- Stats for the session
  total_cards_reviewed INTEGER NOT NULL DEFAULT 0,
  effective_answers INTEGER NOT NULL DEFAULT 0
);

-- Index for study sessions
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);

-- Function to check for exact duplicate cards
CREATE OR REPLACE FUNCTION check_exact_duplicate(
  p_user_id UUID,
  p_front TEXT,
  p_back TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM cards
    WHERE user_id = p_user_id
      AND front = p_front
      AND back = p_back
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$ LANGUAGE plpgsql;

-- Function to get cards due for review for a user
CREATE OR REPLACE FUNCTION get_cards_due_for_review(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
) RETURNS TABLE (
  card_id UUID,
  front TEXT,
  back TEXT,
  last_review_date TIMESTAMP WITH TIME ZONE,
  last_rating SMALLINT,
  ease_factor FLOAT,
  interval_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_reviews AS (
    SELECT DISTINCT ON (cr.card_id)
      cr.card_id,
      cr.reviewed_at,
      cr.rating,
      cr.next_review_date,
      cr.ease_factor,
      cr.interval_days
    FROM
      card_reviews cr
    WHERE
      cr.user_id = p_user_id
    ORDER BY
      cr.card_id,
      cr.reviewed_at DESC
  )
  SELECT
    c.id AS card_id,
    c.front,
    c.back,
    lr.reviewed_at AS last_review_date,
    lr.rating AS last_rating,
    lr.ease_factor,
    lr.interval_days
  FROM
    cards c
  LEFT JOIN
    latest_reviews lr ON c.id = lr.card_id
  WHERE
    c.user_id = p_user_id
    AND (
      lr.next_review_date IS NULL
      OR lr.next_review_date <= NOW()
    )
  ORDER BY
    lr.next_review_date ASC NULLS FIRST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to reset learning history for selected cards
CREATE OR REPLACE FUNCTION reset_card_learning_history(
  p_user_id UUID,
  p_card_ids UUID[]
) RETURNS VOID AS $$
BEGIN
  -- Delete all card reviews for the specified cards
  DELETE FROM card_reviews
  WHERE user_id = p_user_id
    AND card_id = ANY(p_card_ids);
END;
$$ LANGUAGE plpgsql;

-- Function to update study session statistics after completion
CREATE OR REPLACE FUNCTION update_study_session_stats(
  p_session_id UUID,
  p_ended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS VOID AS $$
DECLARE
  v_total_cards INTEGER;
  v_effective_answers INTEGER;
BEGIN
  -- Count total cards reviewed in this session
  SELECT COUNT(*)
  FROM card_reviews
  WHERE reviewed_at BETWEEN 
    (SELECT started_at FROM study_sessions WHERE id = p_session_id)
    AND p_ended_at
    AND user_id = (SELECT user_id FROM study_sessions WHERE id = p_session_id)
  INTO v_total_cards;
  
  -- Count effective answers in this session
  SELECT COUNT(*)
  FROM card_reviews
  WHERE reviewed_at BETWEEN 
    (SELECT started_at FROM study_sessions WHERE id = p_session_id)
    AND p_ended_at
    AND user_id = (SELECT user_id FROM study_sessions WHERE id = p_session_id)
    AND effective = TRUE
  INTO v_effective_answers;
  
  -- Update the session stats
  UPDATE study_sessions
  SET 
    ended_at = p_ended_at,
    total_cards_reviewed = v_total_cards,
    effective_answers = v_effective_answers
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security policies
-- These ensure users can only access their own data

-- Cards table RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY cards_select_policy ON cards
  FOR SELECT USING (user_id = auth.uid());
  
CREATE POLICY cards_insert_policy ON cards
  FOR INSERT WITH CHECK (user_id = auth.uid());
  
CREATE POLICY cards_update_policy ON cards
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
  
CREATE POLICY cards_delete_policy ON cards
  FOR DELETE USING (user_id = auth.uid());

-- Card reviews table RLS
ALTER TABLE card_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY card_reviews_select_policy ON card_reviews
  FOR SELECT USING (user_id = auth.uid());
  
CREATE POLICY card_reviews_insert_policy ON card_reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());
  
CREATE POLICY card_reviews_update_policy ON card_reviews
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
  
CREATE POLICY card_reviews_delete_policy ON card_reviews
  FOR DELETE USING (user_id = auth.uid());

-- Study sessions table RLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY study_sessions_select_policy ON study_sessions
  FOR SELECT USING (user_id = auth.uid());
  
CREATE POLICY study_sessions_insert_policy ON study_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());
  
CREATE POLICY study_sessions_update_policy ON study_sessions
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
  
CREATE POLICY study_sessions_delete_policy ON study_sessions
  FOR DELETE USING (user_id = auth.uid()); 