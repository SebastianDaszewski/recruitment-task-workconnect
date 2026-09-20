'use client';

import { useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';
import type { ReactNode } from 'react';
import type { AnyFieldApi } from '@tanstack/form-core';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { productFeatures } from '@/features/products/data';
import { availabilitySchema, basicInfoSchema, priceSchema, type BasicInfo } from '@/features/products/schemas';
import type { Product } from '@/features/products/types';
import { ProductStepper } from './product-stepper';

type ProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated: (product: Product) => void;
};

// "Cena netto/brutto" are numeric fields: accept digits and a single decimal
// separator only, so letters or a second dot can never reach the form state.
const sanitizeDecimal = (value: string) => value
  .replace(',', '.')
  .replace(/[^\d.]/g, '')
  .replace(/(\..*)\./g, '$1');

const toMessage = (error: unknown) => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  return undefined;
};

// `errorMap` keeps one entry per validation cause (onChange/onBlur/onSubmit), each
// only refreshed when that cause last ran. onChange fires on every keystroke once
// the field is touched, so it's always the freshest — reading `.errors[0]` instead
// picks whichever cause happened to populate its key first (usually the stale
// onBlur entry from before the user kept typing), so the message stops updating
// live and only "jumps" to the correct text on the next blur.
const getFieldError = (errorMap: Record<string, unknown> | undefined) => {
  if (!errorMap) return undefined;
  for (const cause of ['onChange', 'onBlur', 'onSubmit', 'onMount'] as const) {
    const errors = errorMap[cause];
    if (Array.isArray(errors) && errors.length > 0) return toMessage(errors[0]);
  }
  return undefined;
};

type FieldRenderer = (props: { name: string; children: (field: AnyFieldApi) => ReactNode }) => ReactNode;
type FormFieldApi = { Field: FieldRenderer };

type PriceValues = {
  netPrice: string;
  grossPrice: string;
  vat: string;
  currency: string;
};

type AvailabilityValues = {
  available: boolean;
  limited: boolean;
  stock: string;
  minCart: string;
  maxCart: string;
};

type StepFormApi<TValues> = FormFieldApi & {
  state: { values: TValues; canSubmit: boolean };
  setFieldValue: (field: keyof TValues, value: string | boolean) => void;
};

// Reserves a fixed, single-line slot for the error message so it never wraps or
// grows the field — the dialog's size stays stable whether or not an error shows.
function FieldError({ message }: { message?: string }) {
  return <p className="m-0 h-4 truncate text-xs leading-4 text-catalog-red" title={message}>{message ?? ''}</p>;
}

export function ProductDialog({ open, onOpenChange, onProductCreated }: ProductDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const productForm = useForm({
    defaultValues: { productName: '', sku: '', description: '', manufacturer: '', category: '', features: [] as string[] },
    validators: { onChange: basicInfoSchema, onBlur: basicInfoSchema },
    onSubmit: () => undefined,
  });
  const priceForm = useForm({
    defaultValues: { netPrice: '0.00', grossPrice: '0.00', vat: '23', currency: 'PLN' },
    validators: { onChange: priceSchema, onBlur: priceSchema },
    onSubmit: () => undefined,
  });
  const availabilityForm = useForm({
    defaultValues: { available: true, limited: false, stock: '', minCart: '1', maxCart: '10' },
    validators: { onChange: availabilitySchema, onBlur: availabilitySchema },
    onSubmit: () => undefined,
  });

  if (typeof window !== 'undefined') (window as unknown as { __DEBUG_FORM__?: unknown }).__DEBUG_FORM__ = productForm;

  const reset = () => {
    productForm.reset();
    priceForm.reset();
    availabilityForm.reset();
    setCurrentStep(1);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  };

  const updateNetPrice = (rawValue: string) => {
    const value = sanitizeDecimal(rawValue);
    priceForm.setFieldValue('netPrice', value);
    const parsed = Number(value);
    const tax = Number(priceForm.state.values.vat.replace(',', '.'));
    priceForm.setFieldValue('grossPrice', Number.isFinite(parsed) ? (parsed * (1 + tax / 100)).toFixed(2) : '');
  };

  const updateGrossPrice = (rawValue: string) => {
    const value = sanitizeDecimal(rawValue);
    priceForm.setFieldValue('grossPrice', value);
    const parsed = Number(value);
    const tax = Number(priceForm.state.values.vat.replace(',', '.'));
    priceForm.setFieldValue('netPrice', Number.isFinite(parsed) ? (parsed / (1 + tax / 100)).toFixed(2) : '');
  };

  const updateVat = (value: string) => {
    priceForm.setFieldValue('vat', value);
    const tax = Number(value.replace(',', '.'));
    const parsed = Number(priceForm.state.values.netPrice.replace(',', '.'));
    priceForm.setFieldValue('grossPrice', Number.isFinite(tax) && Number.isFinite(parsed) ? (parsed * (1 + tax / 100)).toFixed(2) : '');
  };

  // Subscribed reads: the form store mutates internally on every keystroke, so
  // deriving validity from a plain `.state` read would never trigger a re-render
  // here and "Dalej"/"Zapisz" would stay stuck in their initial (disabled) state.
  const productValues = useStore(productForm.store, (state) => state.values);
  const priceValues = useStore(priceForm.store, (state) => state.values);
  const priceCanSubmit = useStore(priceForm.store, (state) => state.canSubmit);
  const availabilityValues = useStore(availabilityForm.store, (state) => state.values);
  const availabilityCanSubmit = useStore(availabilityForm.store, (state) => state.canSubmit);
  const basicInfoIsValid = basicInfoSchema.safeParse(productValues).success;
  const availabilityIsValid = availabilityCanSubmit && availabilitySchema.safeParse(availabilityValues).success;

  const saveProduct = () => {
    if (!availabilityIsValid) return;
    const values = productValues;
    const category = { computers: 'Komputery', phones: 'Telefony', rtv: 'RTV', accessories: 'Akcesoria' }[values.category] ?? values.category;
    onProductCreated({ name: values.productName, sku: values.sku, category, price: `${Number(priceValues.grossPrice).toFixed(2).replace('.', ',')} ${priceValues.currency}`, available: availabilityValues.available, stock: availabilityValues.limited ? Number(availabilityValues.stock) : null });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="catalog-dialog gap-0 overflow-hidden rounded-xl border border-catalog-line p-0">
        <div className="px-4 pb-4 pt-6"><DialogTitle className="m-0 text-base font-medium leading-none text-catalog-dark">Dodaj nowy produkt</DialogTitle></div>
        <ProductStepper currentStep={currentStep} />
        <form className="flex flex-col gap-4 px-4 pb-5 pt-0 md:pt-5" onSubmit={(event) => { event.preventDefault(); }}>
          {currentStep === 1 ? <BasicInfoFields form={productForm as unknown as FormFieldApi} /> : null}
          {currentStep === 2 ? <PriceFields form={priceForm as unknown as StepFormApi<PriceValues>} onNetChange={updateNetPrice} onGrossChange={updateGrossPrice} onVatChange={updateVat} /> : null}
          {currentStep === 3 ? <AvailabilityFields form={availabilityForm as unknown as StepFormApi<AvailabilityValues>} /> : null}
        </form>
        <DialogFooter currentStep={currentStep} canSubmitBasic={basicInfoIsValid} priceIsValid={priceCanSubmit} availabilityIsValid={availabilityIsValid} onBack={() => setCurrentStep((step) => step - 1)} onNext={() => setCurrentStep((step) => step + 1)} onSave={saveProduct} onValidateBasic={() => { void productForm.handleSubmit(); }} />
      </DialogContent>
    </Dialog>
  );
}

function BasicInfoFields({ form }: { form: FormFieldApi }) {
  return <>
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <FormInput label="Nazwa produktu" placeholder="np. MacBook Pro 14" field={form.Field} name="productName" />
      <FormInput label="SKU produktu" placeholder="np. MBP14M3PRO" field={form.Field} name="sku" />
    </div>
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor="description">Opis produktu</Label>
      <form.Field name="description">{(field: AnyFieldApi) => <Textarea id="description" className="min-h-16 resize-none rounded-lg border-catalog-field-border pt-2.5 text-sm shadow-none" value={field.state.value as string} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} placeholder="Krótki opis produktu" />}</form.Field>
      <FieldError />
    </div>
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <FormSelect label="Producent" placeholder="Wybierz producenta" name="manufacturer" field={form.Field} options={{ apple: 'Apple', samsung: 'Samsung', sony: 'Sony', bosch: 'Bosch' }} />
      <FormSelect label="Kategoria" placeholder="Wybierz kategorię" name="category" field={form.Field} options={{ computers: 'Komputery', phones: 'Telefony', rtv: 'RTV', accessories: 'Akcesoria' }} />
    </div>
    <form.Field name="features">{(field: AnyFieldApi) => { const features = field.state.value as string[]; const error = field.state.meta.isTouched ? getFieldError(field.state.meta.errorMap) : undefined; return <fieldset className="flex min-w-0 flex-col gap-2 border-0 p-0"><legend className={`p-0 text-sm font-medium ${error ? 'text-catalog-red' : 'text-catalog-label'}`}>Cechy produktu</legend><div className="flex flex-wrap gap-2">{productFeatures.map((feature) => <button key={feature} type="button" className={`h-6 cursor-pointer rounded-full border px-2 text-sm ${features.includes(feature) ? 'border-catalog-primary bg-catalog-feature text-catalog-primary' : 'border-catalog-field-border bg-white text-catalog-muted'}`} onClick={() => { field.handleChange(features.includes(feature) ? features.filter((item) => item !== feature) : [...features, feature]); field.handleBlur(); }}>{feature}</button>)}</div><FieldError message={error} /></fieldset>; }}</form.Field>
  </>;
}

function FormInput({ label, placeholder, field: Field, name }: { label: string; placeholder: string; field: FieldRenderer; name: keyof BasicInfo }) {
  return <div className="flex min-w-0 flex-col gap-2">
    <Field name={name}>{(field: AnyFieldApi) => { const error = field.state.meta.isTouched ? getFieldError(field.state.meta.errorMap) : undefined; return <><Label htmlFor={name} className={error ? 'text-catalog-red' : undefined}>{label}</Label><Input id={name} aria-invalid={Boolean(error)} className="h-8 rounded-full border-catalog-field-border text-sm shadow-none" value={field.state.value as string} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} placeholder={placeholder} /><FieldError message={error} /></>; }}</Field>
  </div>;
}

function FormSelect({ label, placeholder, name, field: Field, options }: { label: string; placeholder: string; name: keyof BasicInfo; field: FieldRenderer; options: Record<string, string> }) {
  return <div className="flex min-w-0 flex-col gap-2">
    <Field name={name}>{(field: AnyFieldApi) => { const error = field.state.meta.isTouched ? getFieldError(field.state.meta.errorMap) : undefined; return <><Label htmlFor={name} className={error ? 'text-catalog-red' : undefined}>{label}</Label><Select value={field.state.value as string} onValueChange={(value) => field.handleChange(value ?? '')}><SelectTrigger id={name} aria-invalid={Boolean(error)} onBlur={field.handleBlur} className="h-8 w-full rounded-full border-catalog-field-border text-sm shadow-none"><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{Object.entries(options).map(([value, text]) => <SelectItem key={value} value={value}>{text}</SelectItem>)}</SelectContent></Select><FieldError message={error} /></>; }}</Field>
  </div>;
}

function PriceFields({ form, onNetChange, onGrossChange, onVatChange }: { form: StepFormApi<PriceValues>; onNetChange: (value: string) => void; onGrossChange: (value: string) => void; onVatChange: (value: string) => void }) {
  return <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <StepNumberField form={form} name="netPrice" label="Cena netto" onChange={onNetChange} />
      <StepNumberField form={form} name="grossPrice" label="Cena brutto" onChange={onGrossChange} />
    </div>
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <div className="flex flex-col gap-2">
        <Label htmlFor="vat">Stawka VAT</Label>
        <form.Field name="vat">{(field: AnyFieldApi) => <Select value={field.state.value as string} onValueChange={(value) => onVatChange(value ?? '')}><SelectTrigger id="vat" className="h-8 w-full rounded-full border-catalog-field-border text-sm shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">0%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="8">8%</SelectItem><SelectItem value="23">23%</SelectItem></SelectContent></Select>}</form.Field>
        <FieldError />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="currency">Waluta</Label>
        <form.Field name="currency">{(field: AnyFieldApi) => <Select value={field.state.value as string} onValueChange={(value) => form.setFieldValue('currency', value ?? '')}><SelectTrigger id="currency" className="h-8 w-full rounded-full border-catalog-field-border text-sm shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PLN">PLN</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent></Select>}</form.Field>
        <FieldError />
      </div>
    </div>
  </div>;
}

function StepNumberField({ form, name, label, onChange }: { form: StepFormApi<PriceValues>; name: 'netPrice' | 'grossPrice'; label: string; onChange: (value: string) => void }) {
  return <div className="flex flex-col gap-2">
    <form.Field name={name}>{(field: AnyFieldApi) => { const error = field.state.meta.isTouched ? getFieldError(field.state.meta.errorMap) : undefined; return <><Label htmlFor={name} className={error ? 'text-catalog-red' : undefined}>{label}</Label><Input id={name} aria-invalid={Boolean(error)} className="h-8 rounded-full border-catalog-field-border text-sm shadow-none" type="text" inputMode="decimal" value={field.state.value as string} onBlur={field.handleBlur} onChange={(event) => onChange(event.target.value)} /><FieldError message={error} /></>; }}</form.Field>
  </div>;
}

function AvailabilityFields({ form }: { form: StepFormApi<AvailabilityValues> }) {
  const values = form.state.values;
  return <div className="flex flex-col gap-4">
    <div className="flex items-center border-b border-catalog-line pb-4">
      <form.Field name="available">{(field: AnyFieldApi) => <Label className="cursor-pointer"><Switch id="available" checked={field.state.value as boolean} onCheckedChange={(checked) => form.setFieldValue('available', checked)} />Produkt jest dostępny</Label>}</form.Field>
    </div>
    <div className="flex items-center border-b border-catalog-line pb-4">
      <form.Field name="limited">{(field: AnyFieldApi) => <Label className="cursor-pointer"><Checkbox id="limited" checked={field.state.value as boolean} onCheckedChange={(checked) => form.setFieldValue('limited', checked)} />Produkt limitowany</Label>}</form.Field>
    </div>
    {values.limited ? <StepIntegerField form={form} name="stock" label="Ilość na magazynie" /> : null}
    <h3 className="m-0 text-base font-medium">Limity koszyka</h3>
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <StepIntegerField form={form} name="minCart" label="Minimalna ilość" />
      <StepIntegerField form={form} name="maxCart" label="Maksymalna ilość" />
    </div>
  </div>;
}

function StepIntegerField({ form, name, label }: { form: StepFormApi<AvailabilityValues>; name: 'stock' | 'minCart' | 'maxCart'; label: string }) {
  return <div className="flex flex-col gap-2">
    <form.Field name={name}>{(field: AnyFieldApi) => { const error = field.state.meta.isTouched ? getFieldError(field.state.meta.errorMap) : undefined; return <><Label htmlFor={name} className={error ? 'text-catalog-red' : undefined}>{label}</Label><Input id={name} aria-invalid={Boolean(error)} className="h-8 rounded-full border-catalog-field-border text-sm shadow-none" type="text" inputMode="numeric" pattern="[0-9]*" value={field.state.value as string} onBlur={field.handleBlur} onChange={(event) => form.setFieldValue(name, event.target.value.replace(/\D/g, ''))} /><FieldError message={error} /></>; }}</form.Field>
  </div>;
}

function DialogFooter({ currentStep, canSubmitBasic, priceIsValid, availabilityIsValid, onBack, onNext, onSave, onValidateBasic }: { currentStep: number; canSubmitBasic: boolean; priceIsValid: boolean; availabilityIsValid: boolean; onBack: () => void; onNext: () => void; onSave: () => void; onValidateBasic: () => void }) {
  return <div className="flex justify-end border-t border-catalog-line p-4">{currentStep > 1 ? <Button type="button" variant="outline" onClick={onBack} className="mr-auto h-9 cursor-pointer rounded-full">← Wstecz</Button> : null}{currentStep === 1 ? <Button type="button" disabled={!canSubmitBasic} onClick={() => { onValidateBasic(); if (canSubmitBasic) onNext(); }} className="h-9 cursor-pointer rounded-full bg-catalog-primary px-4 hover:bg-catalog-primary-hover">Dalej <span className="ml-2 text-lg" aria-hidden="true">→</span></Button> : currentStep === 2 ? <Button type="button" disabled={!priceIsValid} onClick={onNext} className="h-9 cursor-pointer rounded-full bg-catalog-primary px-4 hover:bg-catalog-primary-hover">Dalej <span className="ml-2 text-lg" aria-hidden="true">→</span></Button> : <Button type="button" disabled={!availabilityIsValid} onClick={onSave} className="h-9 cursor-pointer rounded-full bg-catalog-primary px-4 hover:bg-catalog-primary-hover">Zapisz produkt</Button>}</div>;
}
