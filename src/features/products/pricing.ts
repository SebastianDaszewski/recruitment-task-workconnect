export const sanitizeDecimal = (value: string) => {
  const [whole, ...fractions] = value
    .replace(',', '.')
    .replace(/[^\d.]/g, '')
    .split('.');
  return fractions.length > 0 ? `${whole}.${fractions.join('')}` : whole;
};

const toNumber = (value: string) => {
  const trimmed = value.trim();
  return trimmed === '' ? Number.NaN : Number(trimmed.replace(',', '.'));
};

export const calculateGrossPrice = (netPrice: string, vat: string) => {
  const net = toNumber(netPrice);
  const tax = toNumber(vat);
  return Number.isFinite(net) && Number.isFinite(tax) ? (net * (1 + tax / 100)).toFixed(2) : '';
};

export const calculateNetPrice = (grossPrice: string, vat: string) => {
  const gross = toNumber(grossPrice);
  const tax = toNumber(vat);
  return Number.isFinite(gross) && Number.isFinite(tax) ? (gross / (1 + tax / 100)).toFixed(2) : '';
};
