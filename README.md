# 10xCards

Aplikacja do nauki z fiszkami z wykorzystaniem nowoczesnych technologii.

## Struktura aplikacji

### Dashboard

Dashboard jest głównym widokiem aplikacji po zalogowaniu. Zawiera kilka kluczowych sekcji:

- **Sekcja powitalna** - Personalizowane powitanie użytkownika i krótki opis aplikacji.
- **Fiszki do powtórki** - Podsumowanie fiszek oczekujących na powtórzenie, z podziałem na kategorie.
- **Szybkie akcje** - Przyciski umożliwiające szybki dostęp do kluczowych funkcji aplikacji.

### Komponenty

Aplikacja zbudowana jest z modułowych komponentów zgodnych z zasadami Atomic Design:

- **UI Components** - Podstawowe elementy interfejsu: przyciski, karty, pola formularzy.
- **Composite Components** - Złożone komponenty łączące elementy podstawowe w funkcjonalne bloki.
- **Page Components** - Komponenty stron, zarządzające układem i stanem.

## Tech Stack

- **Astro** - Meta-framework do budowy aplikacji webowych
- **React** - Biblioteka do tworzenia interaktywnych komponentów
- **TypeScript** - Typowany superset JavaScript
- **Tailwind CSS** - Utility-first framework CSS
- **Shadcn/ui** - Komponenty UI zbudowane na Radix UI i Tailwind
- **TanStack Query** - Biblioteka do zarządzania stanem i zapytaniami

## Uruchomienie aplikacji

```bash
# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm run dev

# Budowanie aplikacji
npm run build

# Uruchomienie zbudowanej aplikacji
npm run preview
```

## Struktura projektu

```
src/
├── api/            # Endpointy API (Astro)
├── components/     # Komponenty React i Astro
│   ├── dashboard/  # Komponenty dashboardu
│   └── ui/         # Podstawowe komponenty UI
├── hooks/          # Custom hooks
├── layouts/        # Layouty Astro
├── lib/            # Biblioteki i utilities
├── pages/          # Strony Astro
└── types/          # Typy TypeScript
```

## Project Description

10xCards helps users overcome the time-consuming process of manually creating educational flashcards. With this application, users can:

- Generate flashcards using AI based on pasted text (up to 10,000 characters)
- Create flashcards in the classic front-back format
- Interact with a simple user interface focused on core functionality
- Store flashcards in user accounts
- Learn efficiently with an integrated spaced repetition algorithm

The application is designed for anyone who wants to create and learn from flashcards effectively, saving time on preparation.

## Getting Started Locally

### Prerequisites
- Node.js v22.14.0 (use NVM to manage Node versions)
- Git

### Setup
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/10x-cards.git
   cd 10x-cards
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:4321`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run astro` - Run Astro CLI commands
- `npm run lint` - Run ESLint to check for code issues
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code using Prettier

## Project Scope

### What's Included
- User account functionality (registration, login, password editing, account deletion)
- AI-powered flashcard generation from pasted text
- Manual creation and management of flashcards
- Learning with integrated spaced repetition algorithm
- Simple and intuitive user interface

### What's Not Included in MVP
- Advanced spaced repetition algorithm (like SuperMemo, Anki)
- Content import from various file formats (PDF, DOCX, etc.)
- Flashcard sharing between users
- Integrations with other educational platforms
- Mobile applications (web version only initially)
- Flashcard organization into sets/collections
- Advanced learning statistics

### Technical Limitations
- 10,000 character limit for pasted text
- No advanced flashcard management features
- Simple user account system without advanced personalization options
- No offline access
- Initial local deployment

## Project Status

This project is currently in the early development phase. The MVP is focusing on delivering core functionality with a clean, intuitive user interface.

Key metrics for success:
- 75% of AI-generated flashcards accepted by users
- 75% of flashcards created using AI rather than manually
- 50% reduction in time needed to create 10 flashcards compared to manual creation
- Average learning session of at least 5 minutes

## License

This project is proprietary software and all rights are reserved. The source code is not available for redistribution or use outside of the official deployment.