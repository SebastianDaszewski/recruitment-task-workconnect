# WorkConnect — formularz dodawania produktu

Trzyetapowy formularz dodawania produktu osadzony w oknie modalnym, zbudowany zgodnie z zadaniem
rekrutacyjnym WorkConnect (patrz [AGENTS.md](./AGENTS.md)).

## Stack

- **Next.js** (App Router) + React + TypeScript
- **shadcn/ui** (Base UI) — komponenty interfejsu
- **TanStack Form** — stan formularza i nawigacja między krokami
- **Zod** — schematy walidacji dla każdego kroku
- **nuqs** — synchronizacja paginacji tabeli z parametrami URL
- **Tailwind CSS**

## Uruchomienie lokalne

Wymagany Node.js 20+.

```bash
npm install
npm run dev
```

Aplikacja wystartuje pod adresem [http://localhost:3000](http://localhost:3000).

Inne przydatne komendy:

```bash
npm run build   # build produkcyjny
npm run start   # uruchomienie builda produkcyjnego
npm run lint    # ESLint
```

## Funkcjonalność

- Tabela produktów na stronie głównej z 5 przykładowymi produktami (dane mockowe) i paginacją
  trzymaną w parametrach URL (`?page=`) — odświeżenie strony zachowuje widok.
- Przycisk „Dodaj produkt” otwiera modal z trzyetapowym formularzem:
  1. **Informacje** — nazwa, SKU, opis, producent, kategoria, cechy produktu.
  2. **Cena** — cena netto/brutto z automatycznym przeliczaniem wg stawki VAT, waluta.
  3. **Dostępność** — dostępność (switch), limitowanie (checkbox) z warunkowym polem ilości,
     minimalna/maksymalna ilość w koszyku.
- Każdy krok waliduje dane na bieżąco (Zod + TanStack Form) i blokuje przejście dalej, dopóki nie
  jest poprawnie wypełniony; powrót do poprzedniego kroku nie czyści wprowadzonych danych.
- Komunikaty błędów wyświetlane są pod odpowiednimi polami w stałej, jednowierszowej przestrzeni —
  nie wpływają na rozmiar ani układ modala.
- Zamknięcie modala resetuje formularz do kroku 1.
- Po zapisaniu produkt trafia do tabeli na stronie głównej.

## Struktura projektu

```
src/
  app/                      strony Next.js (App Router)
  components/
    products/               tabela produktów, dialog wieloetapowy, stepper
    ui/                      komponenty shadcn/ui
  features/products/
    data.ts                 dane mockowe, listy słownikowe
    schemas.ts               schematy walidacji Zod dla każdego kroku
    types.ts                 typy domenowe
  lib/utils.ts               pomocnicze funkcje (cn)
```

## Deploy

Projekt jest gotowy do wdrożenia na [Vercel](https://vercel.com/new) — wystarczy podłączyć
repozytorium, Vercel automatycznie wykryje konfigurację Next.js.
