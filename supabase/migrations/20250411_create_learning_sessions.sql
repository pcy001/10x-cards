-- Upewnij się, że mamy rozszerzenie do UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Utwórz tabelę learning_sessions
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  flashcards_count INTEGER NOT NULL DEFAULT 0,
  flashcards_reviewed INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  incorrect_answers INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Utwórz indeksy dla szybkiego wyszukiwania
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON public.learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_started_at ON public.learning_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_ended_at ON public.learning_sessions(ended_at);

-- Włącz Row Level Security
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;

-- Polityki RLS dla tabeli learning_sessions
DROP POLICY IF EXISTS "Users can select their own sessions" ON public.learning_sessions;
CREATE POLICY "Users can select their own sessions"
ON public.learning_sessions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.learning_sessions;
CREATE POLICY "Users can insert their own sessions"
ON public.learning_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sessions" ON public.learning_sessions;
CREATE POLICY "Users can update their own sessions"
ON public.learning_sessions FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.learning_sessions;
CREATE POLICY "Users can delete their own sessions"
ON public.learning_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Dodaj komentarz do tabeli
COMMENT ON TABLE public.learning_sessions IS 'Records of user learning sessions with statistics';
