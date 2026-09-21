# WorkConnect — Add Product Form

A three-step product creation form rendered inside a modal dialog, built for the WorkConnect
recruitment task.

## Stack

- **Next.js** (App Router) + React + TypeScript
- **shadcn/ui** (Base UI) — interface components
- **TanStack Form** — form state and step navigation
- **Zod** — validation schema for each step
- **nuqs** — table pagination synced with URL query parameters
- **Tailwind CSS**

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run build        # production build
npm run start        # serve the production build
npm run lint         # ESLint
npm run format       # Prettier
npm run format:check # verify formatting without writing
```

## Tests

```bash
npm test         # single run
npm run test:watch
```

Tests run on Vitest (jsdom environment) with Testing Library. Coverage:

- `features/products/pricing.test.ts` — numeric input normalisation and net ↔ gross conversion for
  every VAT rate.
- `features/products/schemas.test.ts` — the Zod schema of all three steps, including message text
  and edge cases (SKU of exactly 24 characters, zero stock, minimum equal to maximum).
- `components/products/product-dialog/product-dialog.test.tsx` — wizard integration test: step
  navigation, values preserved when going back, when validation messages appear, price conversion,
  the conditional stock field and the reset on close.
- `components/products/product-table/product-table.test.tsx` — column and row rendering (including
  products sharing the same SKU) plus pagination behaviour.

## Features

- Product table on the home page with 5 sample products (mock data) and pagination held in the URL
  (`?page=`), so a page refresh preserves the current view.
- The "Dodaj produkt" button opens a modal with a three-step form:
  1. **Basic information** — name, SKU, description, manufacturer, category, product features.
  2. **Price** — net and gross price with automatic conversion based on the VAT rate, plus currency.
  3. **Availability** — availability switch, a limited-stock checkbox revealing a conditional
     quantity field, and minimum/maximum cart quantity.
- Every step validates as the user types (Zod + TanStack Form) and blocks navigation until it is
  filled in correctly. The primary button stays clickable and reveals the offending fields instead
  of being disabled. Going back to a previous step keeps the entered values.
- Validation messages render below their field in a fixed, single-line slot, so they never resize or
  shift the dialog.
- Messages appear only on fields the user has interacted with, or after a submit attempt. The cart
  quantity fields are treated as a pair — a conflict between them is flagged on both at once.
- Closing the dialog resets the form back to step 1.
- A saved product is appended to the table on the home page.

## Project structure

```
src/
  app/                      Next.js pages (App Router)
  components/
    products/               product table, multi-step dialog, stepper
    ui/                     shadcn/ui components
  features/products/
    data.ts                 mock data and option lists
    pricing.ts              net/gross price conversion
    schemas.ts              Zod validation schema per step
    types.ts                domain types
  lib/utils.ts              helpers (cn)
```

Tests live next to the code they cover, in `*.test.ts(x)` files.

## Deployment

Ready to deploy on [Vercel](https://vercel.com/new) — connect the repository and Vercel will detect
the Next.js configuration automatically.
