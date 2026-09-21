import { categoryLabels } from '@/features/products/data';

import { FormField, FormSelect, FormTextarea, type WizardFormApi } from '../form-controls';
import { FeatureField } from './feature-field';

const manufacturerOptions = { apple: 'Apple', samsung: 'Samsung', sony: 'Sony', bosch: 'Bosch' };

export function BasicInfoFields({ form }: { form: WizardFormApi }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <FormField
          form={form}
          name="productName"
          label="Nazwa produktu"
          placeholder="np. MacBook Pro 14"
        />
        <FormField form={form} name="sku" label="SKU produktu" placeholder="np. MBP14M3PRO" />
      </div>
      <FormTextarea
        form={form}
        name="description"
        label="Opis produktu"
        placeholder="Krótki opis produktu"
      />
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <FormSelect
          form={form}
          name="manufacturer"
          label="Producent"
          placeholder="Wybierz producenta"
          options={manufacturerOptions}
        />
        <FormSelect
          form={form}
          name="category"
          label="Kategoria"
          placeholder="Wybierz kategorię"
          options={categoryLabels}
        />
      </div>
      <FeatureField form={form} />
    </>
  );
}
