'use client';

import { useState } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { categoryLabels } from '@/features/products/data';
import {
  calculateGrossPrice,
  calculateNetPrice,
  sanitizeDecimal,
} from '@/features/products/pricing';
import { availabilitySchema, basicInfoSchema, priceSchema } from '@/features/products/schemas';
import type { Product } from '@/features/products/types';

import { ProductStepper } from '../product-stepper';
import { DialogFooter, wizardSteps } from './dialog-footer';
import { useWizardStep } from './form-controls';
import { AvailabilityFields, BasicInfoFields, PriceFields } from './steps';

type ProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated: (product: Product) => void;
};

export function ProductDialog({ open, onOpenChange, onProductCreated }: ProductDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const basicInfo = useWizardStep(basicInfoSchema, {
    productName: '',
    sku: '',
    description: '',
    manufacturer: '',
    category: '',
    features: [],
  });
  const price = useWizardStep(priceSchema, {
    netPrice: '',
    grossPrice: '',
    vat: '23',
    currency: 'PLN',
  });
  const availability = useWizardStep(availabilitySchema, {
    available: true,
    limited: false,
    stock: '',
    minCart: '1',
    maxCart: '10',
  });

  const limited = Boolean(availability.values.limited);

  const reset = () => {
    basicInfo.form.reset();
    price.form.reset();
    availability.form.reset();
    setCurrentStep(1);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  };

  const updateNetPrice = (rawValue: string) => {
    const value = sanitizeDecimal(rawValue);
    price.form.setFieldValue('netPrice', value);
    price.form.setFieldValue('grossPrice', calculateGrossPrice(value, price.values.vat));
  };

  const updateGrossPrice = (rawValue: string) => {
    const value = sanitizeDecimal(rawValue);
    price.form.setFieldValue('grossPrice', value);
    price.form.setFieldValue('netPrice', calculateNetPrice(value, price.values.vat));
  };

  const updateVat = (value: string) => {
    price.form.setFieldValue('vat', value);
    price.form.setFieldValue('grossPrice', calculateGrossPrice(price.values.netPrice, value));
  };

  const saveProduct = () => {
    if (!availability.isValid) return;
    const category = categoryLabels[basicInfo.values.category] ?? basicInfo.values.category;
    onProductCreated({
      id: crypto.randomUUID(),
      name: basicInfo.values.productName,
      sku: basicInfo.values.sku,
      category,
      price: `${Number(price.values.grossPrice).toFixed(2).replace('.', ',')} ${price.values.currency}`,
      available: availability.values.available,
      stock: availability.values.limited ? Number(availability.values.stock) : null,
    });
    handleOpenChange(false);
  };

  const revealStepErrors = [
    () => {
      void basicInfo.form.handleSubmit();
    },
    () => {
      void price.form.handleSubmit();
    },
    () => {
      void availability.form.handleSubmit();
    },
  ];
  const stepIsValid = [basicInfo.isValid, price.isValid, availability.isValid];

  const handlePrimaryAction = () => {
    revealStepErrors[currentStep - 1]();
    if (!stepIsValid[currentStep - 1]) return;
    if (currentStep < wizardSteps.length) setCurrentStep((step) => step + 1);
    else saveProduct();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="catalog-dialog flex flex-col gap-0 overflow-x-hidden overflow-y-auto rounded-none border-0 border-catalog-line p-0 min-[481px]:rounded-xl min-[481px]:border">
        <div className="px-4 pt-6 pb-4 md:pb-6">
          <DialogTitle className="m-0 text-base leading-none font-medium text-catalog-dark">
            Dodaj nowy produkt
          </DialogTitle>
        </div>
        <ProductStepper currentStep={currentStep} />
        <form
          className="flex flex-1 flex-col gap-4 px-4 pt-4 pb-4 md:pt-5"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          {currentStep === 1 ? <BasicInfoFields form={basicInfo.form} /> : null}
          {currentStep === 2 ? (
            <PriceFields
              form={price.form}
              onNetChange={updateNetPrice}
              onGrossChange={updateGrossPrice}
              onVatChange={updateVat}
            />
          ) : null}
          {currentStep === 3 ? (
            <AvailabilityFields form={availability.form} limited={limited} />
          ) : null}
        </form>
        <DialogFooter
          currentStep={currentStep}
          isValid={stepIsValid[currentStep - 1]}
          onBack={() => setCurrentStep((step) => step - 1)}
          onPrimary={handlePrimaryAction}
        />
      </DialogContent>
    </Dialog>
  );
}
