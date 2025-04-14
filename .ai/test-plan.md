# Plan testów dla aplikacji 10xCards

## 1. Wprowadzenie i cele testowania

Plan testów dla aplikacji 10xCards ma na celu zapewnienie wysokiej jakości, stabilności i bezpieczeństwa platformy do tworzenia i nauki z fiszek edukacyjnych. Główne cele testowania obejmują:

- Weryfikację poprawnego działania wszystkich funkcjonalności aplikacji zgodnie z wymaganiami
- Zapewnienie odpowiedniego poziomu bezpieczeństwa, szczególnie w zakresie autentykacji i dostępu do danych
- Walidację integracji z zewnętrznymi serwisami (Supabase, OpenRouter)
- Potwierdzenie wydajności aplikacji pod różnym obciążeniem
- Testowanie zgodności z różnymi przeglądarkami i urządzeniami
- Sprawdzenie dostępności aplikacji (accessibility)

## 2. Zakres testów

### 2.1. Komponenty objęte testami

- **Moduł autentykacji**: rejestracja, logowanie, resetowanie hasła, zarządzanie sesją
- **Zarządzanie fiszkami**: tworzenie, edycja, usuwanie, przeglądanie
- **Generowanie fiszek przez AI**: integracja z OpenRouter, jakość generowanych fiszek
- **Algorytm powtórek**: planowanie powtórek, ocenianie znajomości, algorytm spaced repetition
- **Interfejs użytkownika**: responsywność, dostępność, intuicyjność
- **Bezpieczeństwo danych**: izolacja danych użytkowników, polityki RLS, ochrona kluczy API

### 2.2. Elementy wykluczone z testów

- Testowanie kodu źródłowego zewnętrznych bibliotek
- Rozbudowane testy wydajnościowe dla infrastruktury Supabase
- Testy na urządzeniach mobilnych (zgodnie z ograniczeniami MVP)

## 3. Typy testów

### 3.1. Testy jednostkowe

- Testowanie pojedynczych komponentów React
- Testowanie walidatorów i formularzy
- Testowanie funkcji pomocniczych i utilsów
- Testowanie algorytmu powtórek

**Narzędzia**: Vitest, React Testing Library

### 3.2. Testy integracyjne

- Testowanie interakcji między komponentami
- Testowanie integracji z Supabase Auth
- Testowanie przepływów autentykacji
- Testowanie integracji z OpenRouter API

**Narzędzia**: Vitest, React Testing Library, MSW (dla mockowania API)

### 3.3. Testy end-to-end

- Testowanie pełnych ścieżek użytkownika
- Testowanie rejestracji i logowania
- Testowanie tworzenia i nauki z fiszek
- Testowanie generowania fiszek przez AI

**Narzędzia**: Playwright

### 3.4. Testy bezpieczeństwa

- Testowanie Row Level Security (RLS)
- Testowanie autentykacji i autoryzacji
- Testowanie bezpieczeństwa API
- Testowanie przechowywania tokenów

**Narzędzia**: OWASP ZAP, ręczne testowanie, Playwright

### 3.5. Testy wydajnościowe

- Testowanie czasów ładowania stron
- Testowanie wydajności generowania fiszek przez AI
- Testowanie wydajności przeglądania dużej liczby fiszek

**Narzędzia**: Lighthouse, WebPageTest, własne skrypty pomiarowe

### 3.6. Testy dostępności

- Testowanie zgodności z WCAG 2.1 (poziom AA)
- Testowanie czytników ekranowych
- Testowanie nawigacji klawiaturowej

**Narzędzia**: Axe, pa11y, ręczne testowanie z czytnikami ekranowymi

## 4. Scenariusze testowe

### 4.1. Moduł autentykacji

#### 4.1.1. Rejestracja użytkownika

1. **Rejestracja z poprawnymi danymi**
   - Wprowadzenie poprawnego adresu email i silnego hasła
   - Oczekiwany rezultat: Komunikat o potrzebie weryfikacji adresu email

2. **Rejestracja z już istniejącym adresem email**
   - Wprowadzenie adresu email, który jest już zarejestrowany
   - Oczekiwany rezultat: Komunikat o istniejącym koncie

3. **Rejestracja ze słabym hasłem**
   - Wprowadzenie hasła niespełniającego wymogów bezpieczeństwa
   - Oczekiwany rezultat: Komunikat o wymogach dla hasła

#### 4.1.2. Logowanie użytkownika

1. **Logowanie z poprawnymi danymi**
   - Wprowadzenie poprawnego adresu email i hasła
   - Oczekiwany rezultat: Przekierowanie do dashboardu

2. **Logowanie z niepoprawnym hasłem**
   - Wprowadzenie poprawnego adresu email i niepoprawnego hasła
   - Oczekiwany rezultat: Komunikat o błędzie logowania

3. **Logowanie z przekierowaniem (parametr redirect)**
   - Logowanie z parametrem redirect w URL
   - Oczekiwany rezultat: Przekierowanie do wskazanej strony po pomyślnym logowaniu

#### 4.1.3. Resetowanie hasła

1. **Żądanie resetu hasła**
   - Wprowadzenie adresu email i wysłanie formularza
   - Oczekiwany rezultat: Komunikat o wysłaniu linku resetującego

2. **Ustawienie nowego hasła**
   - Kliknięcie w link resetujący i ustawienie nowego hasła
   - Oczekiwany rezultat: Potwierdzenie zmiany hasła i możliwość logowania

#### 4.1.4. Wylogowanie

1. **Wylogowanie użytkownika**
   - Kliknięcie w opcję wylogowania
   - Oczekiwany rezultat: Wylogowanie i przekierowanie na stronę główną

### 4.2. Zarządzanie fiszkami

#### 4.2.1. Tworzenie fiszek manualnie

1. **Tworzenie fiszki z poprawnymi danymi**
   - Wprowadzenie treści dla przodu i tyłu fiszki
   - Oczekiwany rezultat: Fiszka zapisana w bazie danych

2. **Tworzenie fiszki z pustymi polami**
   - Próba zapisania fiszki bez wypełnienia wymaganych pól
   - Oczekiwany rezultat: Komunikat o błędzie walidacji

#### 4.2.2. Generowanie fiszek przez AI

1. **Generowanie fiszek z tekstem źródłowym**
   - Wprowadzenie tekstu źródłowego i inicjacja generowania
   - Oczekiwany rezultat: Lista wygenerowanych fiszek

2. **Akceptowanie/odrzucanie fiszek**
   - Wybór fiszek do zaakceptowania i odrzucenia
   - Oczekiwany rezultat: Zaakceptowane fiszki zapisane w bazie danych

3. **Generowanie z tekstem przekraczającym limit**
   - Wprowadzenie tekstu przekraczającego 10 000 znaków
   - Oczekiwany rezultat: Komunikat o przekroczeniu limitu

#### 4.2.3. Przeglądanie i edycja fiszek

1. **Przeglądanie listy fiszek**
   - Otwarcie strony z listą fiszek
   - Oczekiwany rezultat: Wyświetlenie wszystkich fiszek użytkownika

2. **Edycja istniejącej fiszki**
   - Modyfikacja treści przodu i tyłu fiszki
   - Oczekiwany rezultat: Zaktualizowana fiszka w bazie danych

3. **Usuwanie fiszki**
   - Usunięcie wybranej fiszki
   - Oczekiwany rezultat: Fiszka usunięta z bazy danych i listy

### 4.3. Nauka z fiszkami

#### 4.3.1. Rozpoczęcie sesji nauki

1. **Rozpoczęcie sesji z dostępnymi fiszkami**
   - Inicjacja sesji nauki
   - Oczekiwany rezultat: Prezentacja fiszek do nauki

2. **Rozpoczęcie sesji bez dostępnych fiszek**
   - Inicjacja sesji nauki gdy nie ma fiszek do powtórki
   - Oczekiwany rezultat: Komunikat o braku fiszek do nauki

#### 4.3.2. Ocenianie znajomości fiszek

1. **Ocena znajomości jako "Nie pamiętam"**
   - Wybór opcji "Nie pamiętam" po pokazaniu fiszki
   - Oczekiwany rezultat: Fiszka zaplanowana do natychmiastowej powtórki

2. **Ocena znajomości jako "Dobre"**
   - Wybór opcji "Dobre" po pokazaniu fiszki
   - Oczekiwany rezultat: Fiszka zaplanowana na późniejszą datę zgodnie z algorytmem

3. **Ocena znajomości jako "Łatwe"**
   - Wybór opcji "Łatwe" po pokazaniu fiszki
   - Oczekiwany rezultat: Fiszka zaplanowana na jeszcze późniejszą datę

#### 4.3.3. Zakończenie sesji nauki

1. **Zakończenie sesji po przejrzeniu wszystkich fiszek**
   - Ocena ostatniej fiszki w sesji
   - Oczekiwany rezultat: Podsumowanie sesji nauki

2. **Manualne zakończenie sesji**
   - Kliknięcie przycisku zakończenia sesji
   - Oczekiwany rezultat: Podsumowanie sesji i zapisanie postępu

## 5. Środowisko testowe

### 5.1. Środowisko deweloperskie

- Lokalne środowisko z uruchomioną aplikacją Astro
- Lokalny instancja Supabase dla testów
- Dostęp do kluczy API OpenRouter dla środowiska testowego
- Przeglądarki: Chrome, Firefox, Safari w najnowszych wersjach

### 5.2. Środowisko testowe (staging)

- Wdrożenie aplikacji na serwerze testowym
- Instancja testowa Supabase
- Klucze API OpenRouter dla środowiska testowego
- Dostęp do logów i monitoringu

### 5.3. Środowisko produkcyjne (testy przed-produkcyjne)

- Wdrożenie aplikacji na DigitalOcean (zgodnie z planem wdrożenia)
- Produkcyjna instancja Supabase
- Produkcyjne klucze API z limitami
- Pełne monitorowanie i logowanie

## 6. Narzędzia do testowania

### 6.1. Narzędzia do testów automatycznych

- **Vitest** - framework testów jednostkowych i integracyjnych
- **React Testing Library** - testowanie komponentów React
- **Playwright** - testy end-to-end
- **MSW (Mock Service Worker)** - mockowanie API w testach
- **Axe** - testowanie dostępności
- **Lighthouse** - audyt wydajności i najlepszych praktyk

### 6.2. Narzędzia do testów manualnych

- **DevTools** w przeglądarkach
- **Postman** - testowanie API
- **OWASP ZAP** - testy bezpieczeństwa
- **Screen readers** (np. NVDA, VoiceOver) - testy dostępności

### 6.3. Narzędzia CI/CD

- **GitHub Actions** - automatyczne uruchamianie testów w pipeline
- **Dependabot** - automatyczne aktualizacje zależności

## 7. Harmonogram testów

### 7.1. Testy podczas rozwoju

- Testy jednostkowe i integracyjne uruchamiane przy każdym commit/pull request
- Testy dostępności uruchamiane dla zmian w komponentach UI
- Testy bezpieczeństwa uruchamiane przy zmianach w logice autentykacji/autoryzacji

### 7.2. Testy przed wdrożeniem

- Pełny zestaw testów automatycznych
- Testy manualne kluczowych funkcjonalności
- Testy wydajnościowe
- Testy bezpieczeństwa
- Testy dostępności

### 7.3. Testy po wdrożeniu

- Monitoring produkcji
- Testy smoke po każdym wdrożeniu
- Regularne testy bezpieczeństwa (co miesiąc)
- Audyt wydajności (co kwartał)

## 8. Kryteria akceptacji testów

### 8.1. Kryteria ilościowe

- 90% pokrycia testami dla kluczowych modułów (autentykacja, zarządzanie fiszkami)
- 80% pokrycia testami dla całości kodu
- Wszystkie testy end-to-end przechodzą pomyślnie
- Brak krytycznych i wysokich błędów bezpieczeństwa
- Ocena Lighthouse: minimum 90 dla Performance, Accessibility, Best Practices

### 8.2. Kryteria jakościowe

- Wszystkie główne ścieżki użytkownika działają bez błędów
- Dostępność zgodna z WCAG 2.1 AA
- Odpowiednie komunikaty błędów
- Spójne działanie na wszystkich wspieranych przeglądarkach
- Bezpieczne zarządzanie danymi użytkownika

## 9. Role i odpowiedzialności

### 9.1. Zespół deweloperski

- Implementacja testów jednostkowych
- Implementacja testów integracyjnych
- Naprawianie błędów znalezionych podczas testów

### 9.2. Tester QA

- Projektowanie i wykonywanie testów manualnych
- Implementacja i utrzymanie testów end-to-end
- Raportowanie i śledzenie błędów
- Weryfikacja napraw

### 9.3. DevOps

- Konfiguracja i utrzymanie środowisk testowych
- Konfiguracja CI/CD dla testów
- Monitorowanie wydajności i bezpieczeństwa

### 9.4. Kierownik projektu

- Definiowanie priorytetów testowania
- Decyzje o akceptacji ryzyka
- Koordynacja procesu testowania

## 10. Procedury raportowania błędów

### 10.1. Klasyfikacja błędów

- **Krytyczny**: Blokuje kluczowe funkcjonalności, powoduje utratę danych lub stwarza zagrożenie bezpieczeństwa
- **Wysoki**: Znacząco wpływa na funkcjonalność, ale istnieją obejścia
- **Średni**: Wpływa na funkcjonalność, ale nie blokuje głównych ścieżek użytkownika
- **Niski**: Drobne problemy, głównie kosmetyczne

### 10.2. Proces raportowania

1. Wykrycie błędu
2. Dokumentacja (kroki do odtworzenia, oczekiwane vs rzeczywiste zachowanie)
3. Klasyfikacja wagi błędu
4. Zgłoszenie w systemie śledzenia błędów (GitHub Issues)
5. Przypisanie do odpowiedzialnej osoby

### 10.3. Proces weryfikacji naprawy

1. Deweloper naprawia błąd i tworzy pull request
2. Automatyczne testy weryfikują naprawę
3. Tester QA weryfikuje naprawę manualnie
4. Po pozytywnej weryfikacji, błąd zostaje zamknięty

## 11. Raportowanie wyników testów

### 11.1. Raporty z automatycznych testów

- Generowane automatycznie po każdym uruchomieniu testów w CI/CD
- Zawierają informacje o pokryciu testami, liczbie testów, czasie wykonania
- Dostępne dla zespołu w panelu GitHub Actions

### 11.2. Raporty z testów manualnych

- Przygotowywane po każdej sesji testów manualnych
- Zawierają informacje o testowanych funkcjonalnościach, znalezionych błędach
- Rekomendacje dotyczące jakości produktu

### 11.3. Raport końcowy przed wdrożeniem

- Podsumowanie wszystkich testów
- Lista znanych błędów i ograniczeń
- Rekomendacja dotycząca gotowości do wdrożenia
- Metryki jakości

## 12. Załączniki

- Przykładowe szablony raportów błędów
- Szczegółowe scenariusze testowe dla kluczowych funkcjonalności
- Narzędzia i skrypty pomocnicze do testowania
- Wytyczne dotyczące przygotowania środowiska testowego 