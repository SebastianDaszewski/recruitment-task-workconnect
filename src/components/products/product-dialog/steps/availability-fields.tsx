import type { ReactNode } from 'react';

import type { AnyFieldApi } from '@tanstack/form-core';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { FormField, type WizardFormApi } from '../form-controls';

type ToggleControlProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

const digitsOnly = (value: string, field: AnyFieldApi) =>
  field.handleChange(value.replace(/\D/g, ''));

function ToggleRow({
  form,
  name,
  label,
  control,
}: {
  form: WizardFormApi;
  name: string;
  label: string;
  control: (props: ToggleControlProps) => ReactNode;
}) {
  return (
    <div className="flex items-center border-b border-catalog-line pb-4">
      <form.Field name={name}>
        {(field: AnyFieldApi) => (
          <Label className="cursor-pointer">
            {control({
              id: name,
              checked: field.state.value as boolean,
              onCheckedChange: (checked) => field.handleChange(checked),
            })}
            {label}
          </Label>
        )}
      </form.Field>
    </div>
  );
}

export function AvailabilityFields({ form, limited }: { form: WizardFormApi; limited: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <ToggleRow
        form={form}
        name="available"
        label="Produkt jest dostępny"
        control={(props) => <Switch {...props} />}
      />
      <ToggleRow
        form={form}
        name="limited"
        label="Produkt limitowany"
        control={(props) => <Checkbox {...props} />}
      />
      {limited ? (
        <FormField
          form={form}
          name="stock"
          label="Ilość na magazynie"
          inputMode="numeric"
          onChange={digitsOnly}
        />
      ) : null}
      <h3 className="m-0 text-base font-medium">Limity koszyka</h3>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <FormField
          form={form}
          name="minCart"
          label="Minimalna ilość"
          inputMode="numeric"
          onChange={digitsOnly}
          revealWith={['maxCart']}
        />
        <FormField
          form={form}
          name="maxCart"
          label="Maksymalna ilość"
          inputMode="numeric"
          onChange={digitsOnly}
          revealWith={['minCart']}
        />
      </div>
    </div>
  );
}
