import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Product } from '@/features/products/types';

import { ProductTable } from './index';

const makeProduct = (index: number, overrides: Partial<Product> = {}): Product => ({
  id: `id-${index}`,
  name: `Produkt ${index}`,
  sku: 'POWTORZONESKU',
  category: 'Telefony',
  price: '10,00 PLN',
  available: true,
  stock: null,
  ...overrides,
});

const renderTable = (products: Product[], page = 1, pageCount = 1) => {
  const onPageChange = vi.fn();
  render(
    <ProductTable
      products={products}
      page={page}
      pageCount={pageCount}
      totalCount={products.length}
      onPageChange={onPageChange}
    />,
  );
  return { onPageChange };
};

const bodyRows = () => {
  const body = screen.getByRole('table').querySelector('tbody');
  return [...(body?.querySelectorAll<HTMLTableRowElement>('tr:not([aria-hidden])') ?? [])];
};

describe('ProductTable', () => {
  it('renderuje wszystkie wymagane kolumny', () => {
    renderTable([makeProduct(1)]);
    for (const column of ['Nazwa', 'SKU', 'Kategoria', 'Cena Brutto', 'Status', 'Magazyn']) {
      expect(screen.getByRole('columnheader', { name: column })).toBeInTheDocument();
    }
  });

  it('renderuje dokładnie tyle wierszy, ile przekazanych produktów', () => {
    renderTable([makeProduct(1), makeProduct(2), makeProduct(3)]);
    expect(bodyRows()).toHaveLength(3);
  });

  it('nie gubi ani nie duplikuje wierszy, gdy produkty mają identyczne SKU', () => {
    const products = [1, 2, 3, 4, 5].map((index) => makeProduct(index));
    renderTable(products);
    const table = screen.getByRole('table');
    expect(bodyRows()).toHaveLength(5);
    for (const product of products) {
      expect(within(table).getByText(product.name)).toBeInTheDocument();
    }
  });

  it('pokazuje myślnik, gdy produkt nie ma stanu magazynowego', () => {
    renderTable([makeProduct(1, { stock: null })]);
    expect(within(bodyRows()[0]).getByText('—')).toBeInTheDocument();
  });

  it('pokazuje zerowy stan magazynowy zamiast myślnika', () => {
    renderTable([makeProduct(1, { stock: 0 })]);
    expect(within(bodyRows()[0]).getByText('0')).toBeInTheDocument();
    expect(within(bodyRows()[0]).queryByText('—')).not.toBeInTheDocument();
  });

  it('rozróżnia status dostępności', () => {
    renderTable([makeProduct(1, { available: true }), makeProduct(2, { available: false })]);
    const table = within(screen.getByRole('table'));
    expect(table.getByText('Dostępny')).toBeInTheDocument();
    expect(table.getByText('Niedostępny')).toBeInTheDocument();
  });

  it('powiela ten sam zestaw produktów w widoku mobilnym', () => {
    const products = [makeProduct(1), makeProduct(2)];
    renderTable(products);
    for (const product of products) {
      expect(screen.getAllByText(product.name)).toHaveLength(2);
    }
  });

  it('pokazuje numer strony i łączną liczbę produktów', () => {
    renderTable([makeProduct(1)], 2, 3);
    expect(screen.getByText(/Strona 2 z 3/)).toBeInTheDocument();
    expect(screen.getByText(/1 produktów/)).toBeInTheDocument();
  });
});

describe('Paginacja', () => {
  it('blokuje "Wstecz" na pierwszej stronie', () => {
    renderTable([makeProduct(1)], 1, 3);
    expect(screen.getByRole('button', { name: /Wstecz/ })).toBeDisabled();
  });

  it('blokuje "Dalej" na ostatniej stronie', () => {
    renderTable([makeProduct(1)], 3, 3);
    expect(screen.getByRole('button', { name: /Dalej/ })).toBeDisabled();
  });

  it('oznacza bieżącą stronę atrybutem aria-current', () => {
    renderTable([makeProduct(1)], 2, 3);
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '1' })).not.toHaveAttribute('aria-current');
  });

  it('zgłasza wybraną stronę', async () => {
    const { onPageChange } = renderTable([makeProduct(1)], 1, 3);
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('zgłasza następną stronę po kliknięciu "Dalej"', async () => {
    const { onPageChange } = renderTable([makeProduct(1)], 1, 3);
    await userEvent.click(screen.getByRole('button', { name: /Dalej/ }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
