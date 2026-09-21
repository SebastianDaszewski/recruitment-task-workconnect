import { describe, expect, it } from 'vitest';

import { availabilitySchema, basicInfoSchema, priceSchema } from './schemas';

const messageFor = (schema: { safeParse: (value: unknown) => unknown }, value: unknown) => {
  const result = schema.safeParse(value) as {
    success: boolean;
    error?: { issues: { message: string }[] };
  };
  return result.success ? undefined : result.error?.issues[0]?.message;
};

const validBasicInfo = {
  productName: 'MacBook Pro',
  sku: 'MBP14M3PRO',
  description: '',
  manufacturer: 'apple',
  category: 'computers',
  features: ['Bluetooth'],
};

describe('basicInfoSchema', () => {
  it('przyjmuje poprawny produkt', () => {
    expect(basicInfoSchema.safeParse(validBasicInfo).success).toBe(true);
  });

  it('wymaga nazwy o długości min. 3 znaków', () => {
    expect(messageFor(basicInfoSchema, { ...validBasicInfo, productName: 'ab' })).toBe(
      'Nazwa produktu musi mieć co najmniej 3 znaki.',
    );
  });

  it('nie liczy białych znaków do długości nazwy', () => {
    expect(basicInfoSchema.safeParse({ ...validBasicInfo, productName: '  a  ' }).success).toBe(
      false,
    );
  });

  it('wymaga SKU', () => {
    expect(messageFor(basicInfoSchema, { ...validBasicInfo, sku: '' })).toBe(
      'SKU produktu jest wymagane.',
    );
  });

  it('odrzuca SKU dłuższe niż 24 znaki', () => {
    expect(messageFor(basicInfoSchema, { ...validBasicInfo, sku: 'A'.repeat(25) })).toBe(
      'SKU może mieć maksymalnie 24 znaki.',
    );
  });

  it('przyjmuje SKU o długości dokładnie 24 znaków', () => {
    expect(basicInfoSchema.safeParse({ ...validBasicInfo, sku: 'A'.repeat(24) }).success).toBe(
      true,
    );
  });

  it('odrzuca SKU ze znakami innymi niż litery i cyfry', () => {
    expect(messageFor(basicInfoSchema, { ...validBasicInfo, sku: 'MBP-14' })).toBe(
      'SKU może zawierać tylko litery i cyfry.',
    );
  });

  it('traktuje opis jako opcjonalny', () => {
    expect(basicInfoSchema.safeParse({ ...validBasicInfo, description: '' }).success).toBe(true);
  });

  it('wymaga producenta i kategorii', () => {
    expect(basicInfoSchema.safeParse({ ...validBasicInfo, manufacturer: '' }).success).toBe(false);
    expect(basicInfoSchema.safeParse({ ...validBasicInfo, category: '' }).success).toBe(false);
  });

  it('wymaga co najmniej jednej cechy', () => {
    expect(messageFor(basicInfoSchema, { ...validBasicInfo, features: [] })).toBe(
      'Wybierz co najmniej jedną cechę produktu.',
    );
  });
});

const validPrice = { netPrice: '100', grossPrice: '123', vat: '23', currency: 'PLN' };

describe('priceSchema', () => {
  it('przyjmuje poprawne ceny', () => {
    expect(priceSchema.safeParse(validPrice).success).toBe(true);
  });

  it('konwertuje ceny na liczby', () => {
    const result = priceSchema.parse(validPrice);
    expect(result.netPrice).toBe(100);
    expect(result.grossPrice).toBe(123);
  });

  it.each([
    ['netPrice', 'Cena netto'],
    ['grossPrice', 'Cena brutto'],
  ])('wymaga wypełnienia pola %s', (field, label) => {
    expect(messageFor(priceSchema, { ...validPrice, [field]: '' })).toBe(`${label} jest wymagana.`);
  });

  it('odrzuca ceny nieliczbowe', () => {
    expect(messageFor(priceSchema, { ...validPrice, netPrice: 'abc' })).toBe(
      'Cena netto musi być liczbą.',
    );
  });

  it('odrzuca cenę zerową', () => {
    expect(messageFor(priceSchema, { ...validPrice, netPrice: '0' })).toBe(
      'Cena netto musi być większa od zera.',
    );
  });

  it('odrzuca cenę ujemną', () => {
    expect(priceSchema.safeParse({ ...validPrice, netPrice: '-5' }).success).toBe(false);
  });

  it('wymaga waluty', () => {
    expect(priceSchema.safeParse({ ...validPrice, currency: '' }).success).toBe(false);
  });
});

const validAvailability = {
  available: true,
  limited: false,
  stock: '',
  minCart: '1',
  maxCart: '10',
};

describe('availabilitySchema', () => {
  it('przyjmuje produkt bez limitu', () => {
    expect(availabilitySchema.safeParse(validAvailability).success).toBe(true);
  });

  it('wymaga stanu magazynowego, gdy produkt jest limitowany', () => {
    expect(messageFor(availabilitySchema, { ...validAvailability, limited: true, stock: '' })).toBe(
      'Podaj ilość na magazynie.',
    );
  });

  it('przyjmuje zerowy stan magazynowy przy produkcie limitowanym', () => {
    expect(
      availabilitySchema.safeParse({ ...validAvailability, limited: true, stock: '0' }).success,
    ).toBe(true);
  });

  it('odrzuca niecałkowity stan magazynowy', () => {
    expect(messageFor(availabilitySchema, { ...validAvailability, stock: '1.5' })).toBe(
      'Ilość na magazynie musi być liczbą całkowitą.',
    );
  });

  it('ignoruje stan magazynowy, gdy produkt nie jest limitowany', () => {
    expect(availabilitySchema.safeParse({ ...validAvailability, stock: '' }).success).toBe(true);
  });

  it.each([
    ['minCart', 'Minimalna ilość'],
    ['maxCart', 'Maksymalna ilość'],
  ])('wymaga wypełnienia pola %s', (field, label) => {
    expect(messageFor(availabilitySchema, { ...validAvailability, [field]: '' })).toBe(
      `${label} jest wymagana.`,
    );
  });

  it('odrzuca min większe od max i oznacza oba pola', () => {
    const result = availabilitySchema.safeParse({
      ...validAvailability,
      minCart: '50',
      maxCart: '10',
    });
    expect(result.success).toBe(false);
    const paths = result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
    expect(paths).toContain('minCart');
    expect(paths).toContain('maxCart');
  });

  it('przyjmuje min równe max', () => {
    expect(
      availabilitySchema.safeParse({ ...validAvailability, minCart: '5', maxCart: '5' }).success,
    ).toBe(true);
  });
});
