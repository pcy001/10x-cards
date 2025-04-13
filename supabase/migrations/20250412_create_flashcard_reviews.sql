-- Upewnij się, że mamy rozszerzenie do UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sprawdź czy kolumna user_id istnieje, jeśli nie - dodaj ją
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'flashcard_reviews' 
                  AND column_name = 'user_id') THEN
    ALTER TABLE public.flashcard_reviews 
    ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Sprawdź czy kolumna session_id istnieje, jeśli nie - dodaj ją
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'flashcard_reviews' 
                  AND column_name = 'session_id') THEN
    ALTER TABLE public.flashcard_reviews 
    ADD COLUMN session_id UUID REFERENCES public.learning_sessions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Utwórz indeksy dla dodanych kolumn
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_user_id ON public.flashcard_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_session_id ON public.flashcard_reviews(session_id);

-- Zresetuj cache schematu Supabase
NOTIFY pgrst, 'reload schema';
