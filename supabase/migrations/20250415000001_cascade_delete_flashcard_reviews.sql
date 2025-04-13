-- Migracja dodająca ograniczenie ON DELETE CASCADE do tabeli flashcard_reviews
-- Dzięki temu po usunięciu fiszki, wszystkie powiązane z nią powtórki również zostaną usunięte

-- Najpierw usuwamy istniejące ograniczenie, jeśli istnieje
ALTER TABLE IF EXISTS public.flashcard_reviews
DROP CONSTRAINT IF EXISTS flashcard_reviews_flashcard_id_fkey;

-- Dodajemy nowe ograniczenie z klauzulą ON DELETE CASCADE
ALTER TABLE IF EXISTS public.flashcard_reviews
ADD CONSTRAINT flashcard_reviews_flashcard_id_fkey
FOREIGN KEY (flashcard_id)
REFERENCES public.flashcards(id)
ON DELETE CASCADE; 