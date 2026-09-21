import { FormField, FormSelect, type WizardFormApi } from '../form-controls';

const vatOptions = { '0': '0%', '5': '5%', '8': '8%', '23': '23%' };
const currencyOptions = { PLN: 'PLN', EUR: 'EUR', USD: 'USD' };

type PriceFieldsProps = {
  form: WizardFormApi;
  onNetChange: (value: string) => void;
  onGrossChange: (value: string) => void;
  onVatChange: (value: string) => void;
};

export function PriceFields({ form, onNetChange, onGrossChange, onVatChange }: PriceFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <FormField
          form={form}
          name="netPrice"
          label="Cena netto"
          placeholder="0.00"
          inputMode="decimal"
          onChange={onNetChange}
        />
        <FormField
          form={form}
          name="grossPrice"
          label="Cena brutto"
          placeholder="0.00"
          inputMode="decimal"
          onChange={onGrossChange}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <FormSelect
          form={form}
          name="vat"
          label="Stawka VAT"
          options={vatOptions}
          onChange={onVatChange}
        />
        <FormSelect form={form} name="currency" label="Waluta" options={currencyOptions} />
      </div>
    </div>
  );
}
