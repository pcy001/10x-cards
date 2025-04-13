-- Nazwa: Dodanie kolumn do obsługi sesji nauki i filtrowania fiszek
-- Opis: Ten skrypt dodaje kolumnę is_due_only do tabeli learning_sessions oraz
-- kolumnę session_id do tabeli flashcard_reviews wraz z indeksem i kluczem obcym.

-- Dodaj kolumnę is_due_only do tabeli learning_sessions
ALTER TABLE learning_sessions ADD COLUMN IF NOT EXISTS is_due_only BOOLEAN DEFAULT FALSE;

-- Dodaj kolumnę session_id do tabeli flashcard_reviews
ALTER TABLE flashcard_reviews ADD COLUMN IF NOT EXISTS session_id UUID NULL;

-- Dodaj indeks dla szybszego wyszukiwania
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_session_id ON flashcard_reviews(session_id);

-- Dodaj klucz obcy do tabeli learning_sessions
ALTER TABLE flashcard_reviews 
  DROP CONSTRAINT IF EXISTS fk_flashcard_reviews_session_id;
  
ALTER TABLE flashcard_reviews 
  ADD CONSTRAINT fk_flashcard_reviews_session_id 
  FOREIGN KEY (session_id) 
  REFERENCES learning_sessions(id) 
  ON DELETE SET NULL; 