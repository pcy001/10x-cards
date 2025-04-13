/**
 * Odpowiedź z API zawierająca informacje o liczbie fiszek oczekujących na powtórzenie
 */
export interface DueCountResponse {
  /** Łączna liczba fiszek oczekujących na powtórzenie */
  total: number;

  /** Liczba fiszek oczekujących na powtórzenie pogrupowanych według poziomu trudności */
  byDifficulty: {
    /** Liczba łatwych fiszek */
    easy: number;

    /** Liczba średnich fiszek */
    medium: number;

    /** Liczba trudnych fiszek */
    hard: number;
  };

  /** Liczba fiszek oczekujących na powtórzenie pogrupowanych według typu */
  byCategory: {
    /** Identyfikator kategorii */
    id: string;

    /** Nazwa kategorii */
    name: string;

    /** Liczba fiszek w kategorii */
    count: number;
  }[];
}
