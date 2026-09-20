<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


Zadanie rekrutacyjne
Wieloetapowy formularz dodawania produktu — Frontend (React + Next.js)

Cel zadania
Zbuduj trzyetapowy formularz dodawania produktu, osadzony w oknie modalnym (dialog).
Formularz prowadzi użytkownika krok po kroku, waliduje dane na bieżąco i blokuje przejście dalej,
dopóki bieżący krok nie jest poprawnie wypełniony. Po zatwierdzeniu — produkt trafia do tabeli na
stronie głównej.

Design
Do zadania dołączony jest plik Figma z gotowym projektem UI. Zaimplementuj formularz zgodnie z
tym designem, korzystając z komponentów shadcn/ui — skonfiguruj je i dostosuj tak, aby wiernie
odwzorowywały projekt.

Wymagany stack
• React + Next.js — framework aplikacji
• shadcn/ui — komponenty interfejsu
• TanStack Form — zarządzanie stanem formularza i obsługa kroków
• Zod — schematy walidacji dla każdego kroku
• nuqs — synchronizacja paginacji tabeli z parametrami URL

Struktura interfejsu
• Dialog — formularz działa wewnątrz modala, otwieranego przyciskiem „Dodaj produkt".
Zamknięcie resetuje formularz do kroku 1.
• Tabela produktów — na stronie głównej, z 5 przykładowymi produktami na start (dane
mockowe).
• Paginacja — numer strony trzymany w URL (nuqs). Odświeżenie strony zachowuje widok.
• Kolumny: nazwa, SKU, kategoria, cena brutto z walutą, dostępność, stan magazynowy.

Krok 1 — Informacje podstawowe
Dane identyfikujące produkt oraz jego klasyfikacja.
Pole Typ Walidacja / uwagi
Nazwa produktu Tekst Wymagane, min. 3 znaki

Pole Typ Walidacja / uwagi
SKU produktu Tekst Wymagane, tylko litery i cyfry, maks. 24 znaki
Opis Textarea Opcjonalne
Producent Select Wybór z predefiniowanej listy
Kategoria Select Wybór z predefiniowanej listy
Cechy produktu Multi-select Jedna lub więcej wartości z listy

Krok 2 — Cena
Pola cenowe są powiązane i przeliczają się automatycznie.
Pole Typ Walidacja / uwagi
Cena netto Liczbowe Zmiana przelicza cenę brutto wg stawki VAT
Cena brutto Liczbowe Zmiana przelicza cenę netto wg stawki VAT
VAT Select (%) Zmiana aktualizuje brutto (lub netto)
Waluta Select Wybór z predefiniowanej listy
Wzór: brutto = netto × (1 + VAT / 100). Edycja jednego pola natychmiast przelicza pozostałe.
Krok 3 — Dostępność i stany magazynowe
Informacje o dostępności produktu oraz limity koszyka.
Pole Typ Walidacja / uwagi
Czy produkt jest
dostępny

Switch Wartość logiczna (tak / nie)

Produkt limitowany Checkbox Po zaznaczeniu pojawia się pole ilości na magazynie
Ilość na magazynie Liczbowe Widoczne i wymagane tylko gdy zaznaczono
"limitowany". Nieujemna liczba calkowita
Min. ilość na koszyk Liczbowe Liczba całkowita; nie większa niż maks.
Maks. ilość na koszyk Liczbowe Liczba całkowita; nie mniejsza niż min.

Na co zwrócimy uwagę
• Zgodność implementacji z designem z Figmy
• Poprawność schematów Zod i ich integracja z TanStack Form
• Nawigacja między krokami — dalej tylko przy poprawnych danych, powrót bez utraty
wartości
• Czytelne komunikaty błędów przy odpowiednich polach
• Zachowanie dialogu — otwieranie, zamykanie, reset stanu
• Jakość kodu, typowanie TypeScript, spójne użycie shadcn/ui

Co dostarczyć
• Link do repozytorium (GitHub / GitLab)
• README z instrukcją uruchomienia
• Link do działającej wersji online (np. Vercel, Netlify)
• Termin: 7 dni roboczych od otrzymania zadania

WorkConnect Sp. z o.o. · praca@workconnect.app