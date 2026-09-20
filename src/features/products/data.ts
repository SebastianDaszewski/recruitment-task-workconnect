import type { Product } from './types';

export const pageSize = 5;

export const productFeatures = [
  'Bluetooth',
  'WiFi',
  'USB-C',
  'Wodoodporny',
  'Bezprzewodowy',
  'Ekologiczny',
  'Premium',
];

export const initialProducts: Product[] = [
  { name: 'MacBook Pro 14"', sku: 'MBP14M3PRO', category: 'Komputery', price: '9999,00 PLN', available: true, stock: null },
  { name: 'Galaxy S24 Ultra', sku: 'SGS24U256', category: 'Telefony', price: '6299,00 PLN', available: true, stock: 45 },
  { name: 'Sony WH-1000XM5', sku: 'SNWH1000XM5', category: 'RTV', price: '1599,00 PLN', available: true, stock: null },
  { name: 'Bosch Serie 6 WAU28P40', sku: 'BSWAU28P40', category: 'AGD', price: '3299,00 PLN', available: false, stock: 0 },
  { name: 'Xiaomi Smart Band 8', sku: 'XMSB8BLK', category: 'Akcesoria', price: '179,00 PLN', available: true, stock: null },
];

export const categoryLabels: Record<string, string> = {
  computers: 'Komputery',
  phones: 'Telefony',
  rtv: 'RTV',
  accessories: 'Akcesoria',
};