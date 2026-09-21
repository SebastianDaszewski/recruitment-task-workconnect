import type { ReactNode } from 'react';

import type { AnyFieldApi } from '@tanstack/form-core';
import { useForm, useStore } from '@tanstack/react-form';
import type { z } from 'zod';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const INPUT_CLASS = 'h-8 rounded-full border-catalog-field-border text-sm shadow-none';
const SELECT_CLASS = 'h-8 w-full rounded-full border-catalog-field-border text-sm shadow-none';
const TEXTAREA_CLASS =
  'min-h-16 resize-none rounded-lg border-catalog-field-border pt-2.5 text-sm shadow-none';

const toMessage = (error: unknown) => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string')
    return error.message;
  return undefined;
};

const errorCauses = ['onChange', 'onBlur', 'onSubmit', 'onMount'] as const;

const firstMessage = (errors: unknown) =>
  Array.isArray(errors) && errors.length > 0 ? toMessage(errors[0]) : undefined;

export const getVisibleError = (field: AnyFieldApi, revealWith: string[] = []) => {
  const submitAttempted = field.form.state.submissionAttempts > 0;
  const peerTouched = revealWith.some((name) => field.form.getFieldMeta(name)?.isDirty);
  if (!field.state.meta.isDirty && !peerTouched && !submitAttempted) return undefined;

  const fieldErrors = field.state.meta.errorMap as Record<string, unknown> | undefined;
  const formErrors = field.form.state.errorMap as
    Record<string, Record<string, unknown> | undefined> | undefined;

  for (const cause of errorCauses) {
    const message =
      firstMessage(fieldErrors?.[cause]) ?? firstMessage(formErrors?.[cause]?.[field.name]);
    if (message) return message;
  }
  return undefined;
};

type FieldRenderer = (props: {
  name: string;
  children: (field: AnyFieldApi) => ReactNode;
}) => ReactNode;
export type WizardFormApi = {
  Field: FieldRenderer;
  reset: () => void;
  handleSubmit: () => void | Promise<void>;
  setFieldValue: (name: string, value: unknown) => void;
};

export function useWizardStep<TSchema extends z.ZodType>(
  schema: TSchema,
  defaultValues: z.input<TSchema>,
) {
  const form = useForm({
    defaultValues,
    validators: { onChange: schema as never },
    onSubmit: () => undefined,
  });
  const values = useStore(form.store, (state) => state.values);
  const submitAttempts = useStore(form.store, (state) => state.submissionAttempts);
  const isValid = schema.safeParse(values).success;
  return { form: form as unknown as WizardFormApi, values, isValid, submitAttempts };
}

export function FieldError({ message }: { message?: string }) {
  return (
    <p
      className="absolute inset-x-0 top-full mt-0.5 h-4 truncate text-xs leading-4 text-catalog-red"
      title={message}
    >
      {message ?? ''}
    </p>
  );
}

export function FieldLabel({
  name,
  label,
  error,
}: {
  name?: string;
  label: string;
  error?: string;
}) {
  return (
    <Label htmlFor={name} className={`leading-5 ${error ? 'text-catalog-red' : ''}`}>
      {label}
    </Label>
  );
}

type FormFieldProps = {
  form: WizardFormApi;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  inputMode?: 'text' | 'decimal' | 'numeric';
  onChange?: (value: string, field: AnyFieldApi) => void;
  revealWith?: string[];
};

export function FormField({
  form,
  name,
  label,
  placeholder,
  type = 'text',
  inputMode,
  onChange,
  revealWith,
}: FormFieldProps) {
  return (
    <div className="relative flex min-w-0 flex-col gap-2">
      <form.Field name={name}>
        {(field: AnyFieldApi) => {
          const error = getVisibleError(field, revealWith);
          return (
            <>
              <FieldLabel name={name} label={label} error={error} />
              <Input
                id={name}
                aria-invalid={Boolean(error)}
                className={INPUT_CLASS}
                type={type}
                inputMode={inputMode}
                value={field.state.value as string}
                onBlur={field.handleBlur}
                onChange={(event) =>
                  onChange
                    ? onChange(event.target.value, field)
                    : field.handleChange(event.target.value)
                }
                placeholder={placeholder}
              />
              <FieldError message={error} />
            </>
          );
        }}
      </form.Field>
    </div>
  );
}

type FormSelectProps = {
  form: WizardFormApi;
  name: string;
  label: string;
  options: Record<string, string>;
  placeholder?: string;
  onChange?: (value: string, field: AnyFieldApi) => void;
};

export function FormSelect({ form, name, label, options, placeholder, onChange }: FormSelectProps) {
  return (
    <div className="relative flex min-w-0 flex-col gap-2">
      <form.Field name={name}>
        {(field: AnyFieldApi) => {
          const error = getVisibleError(field);
          return (
            <>
              <FieldLabel name={name} label={label} error={error} />
              <Select
                items={options}
                value={field.state.value as string}
                onValueChange={(value) =>
                  onChange ? onChange(value ?? '', field) : field.handleChange(value ?? '')
                }
              >
                <SelectTrigger
                  id={name}
                  aria-invalid={Boolean(error)}
                  onBlur={field.handleBlur}
                  className={SELECT_CLASS}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(options).map(([value, text]) => (
                    <SelectItem key={value} value={value}>
                      {text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={error} />
            </>
          );
        }}
      </form.Field>
    </div>
  );
}

type FormTextareaProps = {
  form: WizardFormApi;
  name: string;
  label: string;
  placeholder?: string;
};

export function FormTextarea({ form, name, label, placeholder }: FormTextareaProps) {
  return (
    <div className="relative flex min-w-0 flex-col gap-2">
      <FieldLabel name={name} label={label} />
      <form.Field name={name}>
        {(field: AnyFieldApi) => (
          <Textarea
            id={name}
            className={TEXTAREA_CLASS}
            value={field.state.value as string}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            placeholder={placeholder}
          />
        )}
      </form.Field>
      <FieldError />
    </div>
  );
}
