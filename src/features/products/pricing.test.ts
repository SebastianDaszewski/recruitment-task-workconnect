import { describe, expect, it } from 'vitest';

import { calculateGrossPrice, calculateNetPrice, sanitizeDecimal } from './pricing';

describe('sanitizeDecimal', () => {
  it('zamienia przecinek na kropkę', () => {
    expect(sanitizeDecimal('12,50')).toBe('12.50');
  });

  it('usuwa znaki inne niż cyfry i kropka', () => {
    expect(sanitizeDecimal('12zł.5a0')).toBe('12.50');
  });

  it('zostawia tylko pierwszą kropkę', () => {
    expect(sanitizeDecimal('1.2.3.4')).toBe('1.234');
  });

  it('zwraca pusty ciąg dla samych liter', () => {
    expect(sanitizeDecimal('abc')).toBe('');
  });
});

describe('calculateGrossPrice', () => {
  it('stosuje wzór brutto = netto × (1 + VAT / 100)', () => {
    expect(calculateGrossPrice('100', '23')).toBe('123.00');
  });

  it.each([
    ['0', '100.00'],
    ['5', '105.00'],
    ['8', '108.00'],
    ['23', '123.00'],
  ])('dla stawki %s%% zwraca %s', (vat, expected) => {
    expect(calculateGrossPrice('100', vat)).toBe(expected);
  });

  it('akceptuje przecinek jako separator dziesiętny', () => {
    expect(calculateGrossPrice('10,50', '0')).toBe('10.50');
  });

  it('zwraca pusty ciąg dla pustej ceny', () => {
    expect(calculateGrossPrice('', '23')).toBe('');
  });

  it('zwraca pusty ciąg dla pustej stawki VAT', () => {
    expect(calculateGrossPrice('100', '')).toBe('');
  });
});

describe('calculateNetPrice', () => {
  it('odwraca wzór na cenę brutto', () => {
    expect(calculateNetPrice('123', '23')).toBe('100.00');
  });

  it('zwraca pusty ciąg dla pustej ceny', () => {
    expect(calculateNetPrice('', '23')).toBe('');
  });
});

describe('przeliczanie w obie strony', () => {
  it.each(['0', '5', '8', '23'])('jest odwracalne dla stawki %s%%', (vat) => {
    const gross = calculateGrossPrice('249.99', vat);
    expect(calculateNetPrice(gross, vat)).toBe('249.99');
  });
});
