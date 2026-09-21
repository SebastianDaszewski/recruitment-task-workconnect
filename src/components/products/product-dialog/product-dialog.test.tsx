import { useState } from 'react';

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Product } from '@/features/products/types';

import { ProductDialog } from './index';

const onProductCreated = vi.fn();

function Harness() {
  const [open, setOpen] = useState(true);
  return (
    <ProductDialog
      open={open}
      onOpenChange={setOpen}
      onProductCreated={onProductCreated as (product: Product) => void}
    />
  );
}

type User = ReturnType<typeof userEvent.setup>;

const setup = () => {
  const user = userEvent.setup();
  render(<Harness />);
  return user;
};

const primaryButton = () => screen.getByRole('button', { name: /Dalej|Zapisz produkt/ });

const errorFor = (input: HTMLElement) => {
  const paragraph = input.closest('.relative')?.querySelector('p');
  return paragraph?.textContent ?? '';
};

const pickFirstOption = async (user: User, label: string) => {
  await user.click(screen.getByRole('combobox', { name: label }));
  const options = await screen.findAllByRole('option');
  await user.click(options[0]);
};

const fillStepOne = async (user: User) => {
  await user.type(screen.getByLabelText('Nazwa produktu'), 'MacBook Pro');
  await user.type(screen.getByLabelText('SKU produktu'), 'MBP14M3PRO');
  await pickFirstOption(user, 'Producent');
  await pickFirstOption(user, 'Kategoria');
  await user.click(screen.getByRole('button', { name: 'Bluetooth' }));
};

const goToPrices = async (user: User) => {
  await fillStepOne(user);
  await user.click(primaryButton());
  return screen.findByLabelText('Cena netto');
};

const goToAvailability = async (user: User) => {
  const net = await goToPrices(user);
  await user.type(net, '100');
  await waitFor(() => expect(screen.getByLabelText('Cena brutto')).toHaveValue('123.00'));
  await user.click(primaryButton());
  return screen.findByText('Limity koszyka');
};

beforeEach(() => {
  onProductCreated.mockClear();
});

describe('ProductDialog - nawigacja między krokami', () => {
  it('startuje na kroku 1', () => {
    setup();
    expect(screen.getByLabelText('Nazwa produktu')).toBeInTheDocument();
    expect(primaryButton()).toHaveTextContent('Dalej');
  });

  it('nie blokuje przycisku "Dalej", tylko zatrzymuje nawigację', async () => {
    const user = setup();
    expect(primaryButton()).toBeEnabled();
    await user.click(primaryButton());
    expect(screen.getByLabelText('Nazwa produktu')).toBeInTheDocument();
  });

  it('przechodzi dalej po poprawnym wypełnieniu kroku 1', async () => {
    const user = setup();
    await fillStepOne(user);
    await user.click(primaryButton());
    expect(await screen.findByLabelText('Cena netto')).toBeInTheDocument();
  });

  it('zachowuje wartości po powrocie do poprzedniego kroku', async () => {
    const user = setup();
    await goToPrices(user);
    await user.click(screen.getByRole('button', { name: /Wstecz/ }));
    expect(await screen.findByLabelText('Nazwa produktu')).toHaveValue('MacBook Pro');
    expect(screen.getByLabelText('SKU produktu')).toHaveValue('MBP14M3PRO');
  });
});

describe('ProductDialog - komunikaty błędów', () => {
  it('nie pokazuje błędów na polach, których użytkownik nie dotknął', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Bluetooth' }));
    expect(errorFor(screen.getByLabelText('Nazwa produktu'))).toBe('');
    expect(errorFor(screen.getByLabelText('SKU produktu'))).toBe('');
  });

  it('ujawnia błędy wszystkich niepoprawnych pól po kliknięciu "Dalej"', async () => {
    const user = setup();
    await user.click(primaryButton());
    await waitFor(() => {
      expect(errorFor(screen.getByLabelText('Nazwa produktu'))).toMatch(/co najmniej 3 znaki/);
    });
    expect(errorFor(screen.getByLabelText('SKU produktu'))).toMatch(/wymagane/);
  });

  it('aktualizuje komunikat na bieżąco, bez opuszczania pola', async () => {
    const user = setup();
    const sku = screen.getByLabelText('SKU produktu');
    await user.type(sku, 'MBP-14');
    await waitFor(() => expect(errorFor(sku)).toMatch(/tylko litery i cyfry/));
    await user.clear(sku);
    await user.type(sku, 'A'.repeat(25));
    await waitFor(() => expect(errorFor(sku)).toMatch(/maksymalnie 24 znaki/));
  });

  it('czyści komunikat po poprawieniu wartości', async () => {
    const user = setup();
    const name = screen.getByLabelText('Nazwa produktu');
    await user.type(name, 'ab');
    await waitFor(() => expect(errorFor(name)).toMatch(/co najmniej 3 znaki/));
    await user.type(name, 'c');
    await waitFor(() => expect(errorFor(name)).toBe(''));
  });
});

describe('ProductDialog - przeliczanie cen', () => {
  it('przelicza brutto po zmianie netto', async () => {
    const user = setup();
    const net = await goToPrices(user);
    await user.type(net, '100');
    await waitFor(() => expect(screen.getByLabelText('Cena brutto')).toHaveValue('123.00'));
  });

  it('przelicza netto po zmianie brutto', async () => {
    const user = setup();
    await goToPrices(user);
    await user.type(screen.getByLabelText('Cena brutto'), '123');
    await waitFor(() => expect(screen.getByLabelText('Cena netto')).toHaveValue('100.00'));
  });

  it('czyści drugie pole po wyczyszczeniu pierwszego', async () => {
    const user = setup();
    const net = await goToPrices(user);
    await user.type(net, '100');
    await waitFor(() => expect(screen.getByLabelText('Cena brutto')).toHaveValue('123.00'));
    await user.clear(net);
    await waitFor(() => expect(screen.getByLabelText('Cena brutto')).toHaveValue(''));
  });

  it('wymaga ceny większej od zera', async () => {
    const user = setup();
    const net = await goToPrices(user);
    await user.type(net, '0');
    await waitFor(() => expect(errorFor(net)).toMatch(/większa od zera/));
  });
});

describe('ProductDialog - dostępność i stany magazynowe', () => {
  it('pokazuje pole magazynu dopiero po zaznaczeniu "Produkt limitowany"', async () => {
    const user = setup();
    await goToAvailability(user);
    expect(screen.queryByLabelText('Ilość na magazynie')).not.toBeInTheDocument();
    await user.click(screen.getByText('Produkt limitowany'));
    expect(await screen.findByLabelText('Ilość na magazynie')).toBeInTheDocument();
  });

  it('zgłasza brak stanu magazynowego już przy pierwszym kliknięciu "Zapisz produkt"', async () => {
    const user = setup();
    await goToAvailability(user);
    await user.click(screen.getByText('Produkt limitowany'));
    const stock = await screen.findByLabelText('Ilość na magazynie');
    expect(errorFor(stock)).toBe('');

    await user.click(primaryButton());

    await waitFor(() => expect(errorFor(stock)).toMatch(/Podaj ilość na magazynie/));
    expect(onProductCreated).not.toHaveBeenCalled();
  });

  it('oznacza błędem oba pola limitu od razu po edycji jednego z nich', async () => {
    const user = setup();
    await goToAvailability(user);
    const min = screen.getByLabelText('Minimalna ilość');
    await user.clear(min);
    await user.type(min, '50');

    await waitFor(() => expect(errorFor(min)).toMatch(/nie może być większa/));
    expect(errorFor(screen.getByLabelText('Maksymalna ilość'))).toMatch(/nie może być mniejsza/);
  });

  it('oznacza błędem oba pola limitu także po edycji pola maksymalnego', async () => {
    const user = setup();
    await goToAvailability(user);
    const max = screen.getByLabelText('Maksymalna ilość');
    await user.clear(max);
    await user.type(max, '0');

    await waitFor(() => expect(errorFor(max)).toMatch(/nie może być mniejsza/));
    expect(errorFor(screen.getByLabelText('Minimalna ilość'))).toMatch(/nie może być większa/);
  });

  it('czyści błąd z obu pól limitu po usunięciu konfliktu', async () => {
    const user = setup();
    await goToAvailability(user);
    const min = screen.getByLabelText('Minimalna ilość');
    await user.clear(min);
    await user.type(min, '50');
    await waitFor(() => expect(errorFor(min)).toMatch(/nie może być większa/));

    await user.clear(min);
    await user.type(min, '2');

    await waitFor(() => expect(errorFor(min)).toBe(''));
    expect(errorFor(screen.getByLabelText('Maksymalna ilość'))).toBe('');
  });

  it('nie ujawnia błędów niepowiązanych pól przy edycji limitu', async () => {
    const user = setup();
    await goToAvailability(user);
    await user.click(screen.getByText('Produkt limitowany'));
    const stock = await screen.findByLabelText('Ilość na magazynie');
    const min = screen.getByLabelText('Minimalna ilość');
    await user.clear(min);
    await user.type(min, '50');

    await waitFor(() => expect(errorFor(min)).toMatch(/nie może być większa/));
    expect(errorFor(stock)).toBe('');
  });

  it('zapisuje produkt z poprawnymi danymi', async () => {
    const user = setup();
    await goToAvailability(user);
    await user.click(primaryButton());
    await waitFor(() => expect(onProductCreated).toHaveBeenCalledTimes(1));
    expect(onProductCreated.mock.calls[0][0]).toMatchObject({
      name: 'MacBook Pro',
      sku: 'MBP14M3PRO',
      price: '123,00 PLN',
      available: true,
      stock: null,
    });
  });

  it('nadaje każdemu produktowi niepusty identyfikator', async () => {
    const user = setup();
    await goToAvailability(user);
    await user.click(primaryButton());
    await waitFor(() => expect(onProductCreated).toHaveBeenCalled());
    const created = onProductCreated.mock.calls[0][0] as Product;
    expect(created.id).toEqual(expect.any(String));
    expect(created.id.length).toBeGreaterThan(0);
  });
});

describe('ProductDialog - reset po zamknięciu', () => {
  it('wraca do kroku 1 z pustymi polami po ponownym otwarciu', async () => {
    const user = setup();
    await goToPrices(user);

    await user.click(screen.getByRole('button', { name: /Close/i }));
    await waitFor(() => expect(screen.queryByLabelText('Cena netto')).not.toBeInTheDocument());

    render(<Harness />);
    expect(await screen.findByLabelText('Nazwa produktu')).toHaveValue('');
    const dialog = screen.getAllByRole('dialog').at(-1) as HTMLElement;
    expect(within(dialog).getByRole('button', { name: /Dalej/ })).toBeVisible();
  });
});
