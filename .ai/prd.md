# Dokument wymagań produktu (PRD) - 10xCards

## 1. Przegląd produktu

10xCards to aplikacja webowa służąca do szybkiego tworzenia fiszek edukacyjnych przy pomocy sztucznej inteligencji. Aplikacja umożliwia użytkownikom generowanie fiszek na podstawie wklejonego tekstu, a także ich manualną edycję, zarządzanie i naukę z wykorzystaniem algorytmu powtórek odstępowanych w czasie (spaced repetition).

Główne cechy produktu:
- Generowanie fiszek przez AI na podstawie wklejonego tekstu (do 10 000 znaków)
- Tworzenie fiszek w klasycznym formacie przód-tył
- Prosty interfejs użytkownika skupiony na podstawowych funkcjonalnościach
- System kont użytkowników do przechowywania fiszek
- Integracja z istniejącym algorytmem powtórek odstępowanych w czasie

Aplikacja jest przeznaczona dla każdego, kto chce efektywnie tworzyć i uczyć się z fiszek, oszczędzając czas potrzebny na ich przygotowanie.

## 2. Problem użytkownika

Manualne tworzenie wysokiej jakości fiszek edukacyjnych jest czasochłonne, co zniechęca użytkowników do korzystania z efektywnej metody nauki jaką jest technika powtórek odstępowanych w czasie (spaced repetition).

Użytkownicy stoją przed następującymi wyzwaniami:
- Spędzają znaczną ilość czasu na tworzeniu własnych fiszek
- Często rezygnują z nauki z fiszek ze względu na barierę wejścia (czas potrzebny na ich przygotowanie)
- Nie zawsze wiedzą, jakie treści warto umieścić na fiszkach
- Proces manualnego tworzenia fiszek jest monotonny i może zniechęcać do nauki

10xCards rozwiązuje te problemy, automatyzując proces tworzenia fiszek z wykorzystaniem AI, pozwalając użytkownikom skupić się na samej nauce zamiast na przygotowaniach do niej.

## 3. Wymagania funkcjonalne

### 3.1 Funkcje konta użytkownika
- Rejestracja konta użytkownika
- Logowanie do istniejącego konta
- Edycja hasła do konta
- Usunięcie konta użytkownika

### 3.2 Generowanie fiszek
- Wprowadzanie tekstu źródłowego (kopiuj-wklej) do 10 000 znaków
- Generowanie fiszek przez AI na podstawie wprowadzonego tekstu
- Wyświetlanie podglądu wygenerowanych fiszek
- Akceptacja/odrzucanie poszczególnych wygenerowanych fiszek

### 3.3 Zarządzanie fiszkami
- Manualne tworzenie fiszek w formacie przód-tył
- Przeglądanie istniejących fiszek
- Edycja zawartości fiszek (przód i tył)
- Usuwanie niepotrzebnych fiszek

### 3.4 Nauka z fiszkami
- Nauka z wykorzystaniem zintegrowanego algorytmu powtórek
- Ocenianie znajomości fiszek podczas nauki
- Automatyczne planowanie powtórek w oparciu o algorytm spaced repetition

## 4. Granice produktu

### 4.1 Co NIE wchodzi w zakres MVP
- Własny, zaawansowany algorytm powtórek (jak SuperMemo, Anki)
- Import treści z plików w różnych formatach (PDF, DOCX, itp.)
- Współdzielenie zestawów fiszek między użytkownikami
- Integracje z innymi platformami edukacyjnymi
- Aplikacje mobilne (na początek tylko wersja webowa)
- Organizowanie fiszek w zestawy/kolekcje
- Zaawansowane statystyki nauki

### 4.2 Ograniczenia techniczne
- Limit 10 000 znaków dla wklejanego tekstu
- Brak zaawansowanych funkcji zarządzania fiszkami
- Prosty system kont użytkowników bez zaawansowanych opcji personalizacji
- Brak offline'owego dostępu do aplikacji
- Początkowe wdrożenie lokalne

## 5. Historyjki użytkowników

### 5.1 Konto użytkownika

#### US-001: Rejestracja nowego konta
**Opis**: Jako nowy użytkownik, chcę móc utworzyć konto, aby przechowywać moje fiszki.

**Kryteria akceptacji**:
- Użytkownik może wprowadzić adres email i hasło
- System waliduje poprawność adresu email
- System sprawdza siłę i minimalną długość hasła
- Użytkownik otrzymuje potwierdzenie utworzenia konta
- Dane konta są bezpiecznie przechowywane w bazie danych

#### US-002: Logowanie do istniejącego konta
**Opis**: Jako zarejestrowany użytkownik, chcę móc zalogować się do mojego konta, aby uzyskać dostęp do moich fiszek.

**Kryteria akceptacji**:
- Użytkownik może wprowadzić adres email i hasło
- System weryfikuje poprawność danych logowania
- Po poprawnym zalogowaniu, użytkownik ma dostęp do swoich fiszek
- W przypadku błędnych danych, system wyświetla stosowny komunikat

#### US-003: Edycja hasła
**Opis**: Jako zalogowany użytkownik, chcę móc zmienić hasło do mojego konta, aby zwiększyć bezpieczeństwo.

**Kryteria akceptacji**:
- Użytkownik może wprowadzić obecne hasło oraz nowe hasło
- System waliduje poprawność obecnego hasła
- System sprawdza siłę i minimalną długość nowego hasła
- Po zmianie hasła, użytkownik otrzymuje potwierdzenie

#### US-004: Usunięcie konta
**Opis**: Jako zalogowany użytkownik, chcę móc usunąć moje konto, gdy nie będę już korzystać z aplikacji.

**Kryteria akceptacji**:
- Użytkownik może zainicjować proces usuwania konta
- System prosi o potwierdzenie poprzez wprowadzenie hasła
- Po usunięciu konta, wszystkie dane użytkownika są usuwane z bazy danych
- Użytkownik otrzymuje potwierdzenie usunięcia konta

### 5.2 Generowanie fiszek przez AI

#### US-005: Wprowadzanie tekstu źródłowego
**Opis**: Jako zalogowany użytkownik, chcę móc wprowadzić tekst źródłowy, aby wygenerować z niego fiszki.

**Kryteria akceptacji**:
- Interfejs zawiera pole tekstowe do wprowadzenia tekstu
- Użytkownik może wkleić tekst o długości do 10 000 znaków
- System pokazuje licznik pozostałych znaków
- W przypadku przekroczenia limitu, system informuje użytkownika

#### US-006: Generowanie fiszek przez AI
**Opis**: Jako zalogowany użytkownik, chcę móc wygenerować fiszki na podstawie wprowadzonego tekstu za pomocą AI.

**Kryteria akceptacji**:
- Po wprowadzeniu tekstu, użytkownik może kliknąć przycisk generowania
- System wysyła tekst do API AI do przetworzenia
- Podczas generowania, system wyświetla wskaźnik postępu
- Po zakończeniu generowania, system pokazuje wygenerowane fiszki

#### US-007: Przeglądanie wygenerowanych fiszek
**Opis**: Jako zalogowany użytkownik, chcę zobaczyć podgląd wygenerowanych fiszek, aby ocenić ich przydatność.

**Kryteria akceptacji**:
- Wygenerowane fiszki są wyświetlane w formie listy
- Każda fiszka pokazuje zawartość przodu i tyłu
- Użytkownik może przewijać listę fiszek
- Interfejs jest czytelny i przyjazny dla użytkownika

#### US-008: Akceptacja/odrzucanie wygenerowanych fiszek
**Opis**: Jako zalogowany użytkownik, chcę móc zaakceptować lub odrzucić poszczególne wygenerowane fiszki, aby zachować tylko te, które uważam za przydatne.

**Kryteria akceptacji**:
- Przy każdej fiszce znajdują się przyciski akceptacji i odrzucenia
- Po akceptacji, fiszka jest zapisywana w bazie danych użytkownika
- Po odrzuceniu, fiszka jest usuwana z listy
- Użytkownik może zaakceptować/odrzucić wszystkie fiszki jednocześnie

### 5.3 Zarządzanie fiszkami

#### US-009: Manualne tworzenie fiszek
**Opis**: Jako zalogowany użytkownik, chcę móc manualnie tworzyć fiszki, aby uzupełnić kolekcję o własne materiały.

**Kryteria akceptacji**:
- Interfejs zawiera formularz do tworzenia nowej fiszki
- Użytkownik może wprowadzić treść dla przodu i tyłu fiszki
- Po utworzeniu, fiszka jest zapisywana w bazie danych
- Nowa fiszka jest widoczna na liście fiszek użytkownika

#### US-010: Przeglądanie istniejących fiszek
**Opis**: Jako zalogowany użytkownik, chcę móc przeglądać moje istniejące fiszki, aby mieć przegląd dostępnych materiałów.

**Kryteria akceptacji**:
- Fiszki są wyświetlane w formie listy
- Lista może być przewijana, jeśli jest dużo fiszek
- Każda fiszka pokazuje zawartość przodu i tyłu
- Interfejs jest czytelny i przyjazny dla użytkownika

#### US-011: Edycja fiszek
**Opis**: Jako zalogowany użytkownik, chcę móc edytować moje fiszki, aby poprawić błędy lub zaktualizować treść.

**Kryteria akceptacji**:
- Przy każdej fiszce znajduje się przycisk edycji
- Po kliknięciu przycisku edycji, pojawia się formularz z aktualnymi treściami fiszki
- Użytkownik może zmodyfikować zawartość przodu i tyłu
- Po zapisaniu zmian, fiszka jest aktualizowana w bazie danych

#### US-012: Usuwanie fiszek
**Opis**: Jako zalogowany użytkownik, chcę móc usuwać niepotrzebne fiszki, aby utrzymać porządek w mojej kolekcji.

**Kryteria akceptacji**:
- Przy każdej fiszce znajduje się przycisk usuwania
- Po kliknięciu przycisku, system prosi o potwierdzenie
- Po potwierdzeniu, fiszka jest usuwana z bazy danych
- Usunięta fiszka znika z listy fiszek użytkownika

### 5.4 Nauka z fiszkami

#### US-013: Rozpoczęcie sesji nauki
**Opis**: Jako zalogowany użytkownik, chcę móc rozpocząć sesję nauki z moimi fiszkami, aby skutecznie zapamiętać materiał.

**Kryteria akceptacji**:
- Interfejs zawiera przycisk rozpoczęcia sesji nauki
- Po rozpoczęciu sesji, system wybiera fiszki zgodnie z algorytmem powtórek
- Fiszki są prezentowane użytkownikowi w formacie przód-tył
- Użytkownik może przechodzić między przednią i tylną stroną fiszki

#### US-014: Ocena znajomości fiszki
**Opis**: Jako użytkownik w trakcie sesji nauki, chcę móc ocenić swoją znajomość fiszki, aby algorytm mógł zaplanować kolejne powtórki.

**Kryteria akceptacji**:
- Po obejrzeniu tylnej strony fiszki, użytkownik może ocenić swoją znajomość
- Dostępne są przyciski z różnymi poziomami znajomości (np. "Nie pamiętam", "Trudne", "Dobre", "Łatwe")
- Wybór użytkownika jest zapisywany w systemie
- Na podstawie wyboru, algorytm planuje kolejną powtórkę dla danej fiszki

#### US-015: Zakończenie sesji nauki
**Opis**: Jako użytkownik w trakcie sesji nauki, chcę móc zakończyć sesję w dowolnym momencie i zobaczyć podsumowanie.

**Kryteria akceptacji**:
- Interfejs zawiera przycisk zakończenia sesji
- Po zakończeniu, system pokazuje podsumowanie (np. liczba przejrzanych fiszek, odsetek poprawnych odpowiedzi)
- Stan nauki jest zapisywany, aby kontynuować od tego miejsca później
- Użytkownik wraca do głównego ekranu aplikacji

#### US-016: Przeglądanie zaplanowanych powtórek
**Opis**: Jako zalogowany użytkownik, chcę widzieć ile fiszek mam zaplanowanych do powtórki danego dnia, aby zaplanować mój czas nauki.

**Kryteria akceptacji**:
- Na głównym ekranie aplikacji wyświetlana jest liczba fiszek do powtórki danego dnia
- Informacja jest aktualizowana po każdej sesji nauki
- Użytkownik może zobaczyć liczbę fiszek zaplanowanych na najbliższe dni
- Interfejs jest intuicyjny i czytelny

## 6. Metryki sukcesu

### 6.1 Metryki ilościowe
- 75% fiszek wygenerowanych przez AI jest akceptowane przez użytkownika
- Użytkownicy tworzą 75% fiszek z wykorzystaniem AI (a nie manualnie)
- Czas potrzebny na utworzenie zestawu 10 fiszek jest krótszy o co najmniej 50% w porównaniu do manualnego tworzenia
- Średni czas sesji nauki wynosi co najmniej 5 minut

### 6.2 Metryki jakościowe
- Użytkownicy raportują zadowolenie z jakości wygenerowanych fiszek
- Interfejs użytkownika jest oceniany jako intuicyjny i przyjazny
- Użytkownicy regularnie wracają do aplikacji, aby kontynuować naukę
- Użytkownicy polecają aplikację innym osobom 