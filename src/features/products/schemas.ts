import { z } from 'zod';

export const basicInfoSchema = z.object({
  productName: z.string().trim().min(3, 'Nazwa produktu musi mieć co najmniej 3 znaki.'),
  sku: z
    .string()
    .trim()
    .min(1, 'SKU produktu jest wymagane.')
    .max(24, 'SKU może mieć maksymalnie 24 znaki.')
    .regex(/^[a-zA-Z0-9]+$/, 'SKU może zawierać tylko litery i cyfry.'),
  description: z.string(),
  manufacturer: z.string().min(1, 'Wybierz producenta.'),
  category: z.string().min(1, 'Wybierz kategorię.'),
  features: z.array(z.string()).min(1, 'Wybierz co najmniej jedną cechę produktu.'),
});

const priceField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} jest wymagana.`)
    .regex(/^\d+(\.\d+)?$/, `${label} musi być liczbą.`)
    .transform(Number)
    .refine((value) => value > 0, `${label} musi być większa od zera.`);

export const priceSchema = z.object({
  netPrice: priceField('Cena netto'),
  grossPrice: priceField('Cena brutto'),
  vat: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'VAT musi być liczbą.')
    .transform(Number)
    .refine((value) => value >= 0, 'VAT nie może być ujemny.'),
  currency: z.string().min(1, 'Wybierz walutę.'),
});

const integerField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} jest wymagana.`)
    .regex(/^\d+$/, `${label} musi być liczbą całkowitą.`)
    .transform(Number);

export const availabilitySchema = z
  .object({
    available: z.boolean(),
    limited: z.boolean(),
    stock: z.string(),
    minCart: integerField('Minimalna ilość'),
    maxCart: integerField('Maksymalna ilość'),
  })
  .superRefine((value, context) => {
    if (value.limited && !value.stock) {
      context.addIssue({ code: 'custom', path: ['stock'], message: 'Podaj ilość na magazynie.' });
    }

    if (value.stock && !/^\d+$/.test(value.stock)) {
      context.addIssue({
        code: 'custom',
        path: ['stock'],
        message: 'Ilość na magazynie musi być liczbą całkowitą.',
      });
    }

    if (Number(value.minCart) > Number(value.maxCart)) {
      context.addIssue({
        code: 'custom',
        path: ['minCart'],
        message: 'Minimalna ilość nie może być większa od maksymalnej.',
      });
      context.addIssue({
        code: 'custom',
        path: ['maxCart'],
        message: 'Maksymalna ilość nie może być mniejsza od minimalnej.',
      });
    }
  });
