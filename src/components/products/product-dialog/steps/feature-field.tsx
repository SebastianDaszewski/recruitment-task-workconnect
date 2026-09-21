import type { AnyFieldApi } from '@tanstack/form-core';

import { productFeatures } from '@/features/products/data';

import { FieldError, getVisibleError, type WizardFormApi } from '../form-controls';

const FEATURE_CLASS = 'h-6 cursor-pointer rounded-full border px-2 text-sm';
const FEATURE_SELECTED = 'border-catalog-primary bg-catalog-feature text-catalog-primary';
const FEATURE_UNSELECTED = 'border-catalog-field-border bg-white text-catalog-muted';

export function FeatureField({ form }: { form: WizardFormApi }) {
  return (
    <form.Field name="features">
      {(field: AnyFieldApi) => {
        const features = field.state.value as string[];
        const error = getVisibleError(field);

        const toggleFeature = (feature: string) => {
          field.handleChange(
            features.includes(feature)
              ? features.filter((item) => item !== feature)
              : [...features, feature],
          );
          field.handleBlur();
        };

        return (
          <div
            role="group"
            aria-labelledby="features-label"
            className="relative flex min-w-0 flex-col gap-2"
          >
            <span
              id="features-label"
              className={`text-sm leading-5 font-medium ${error ? 'text-catalog-red' : 'text-catalog-label'}`}
            >
              Cechy produktu
            </span>
            <div className="flex flex-wrap gap-2">
              {productFeatures.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  className={`${FEATURE_CLASS} ${features.includes(feature) ? FEATURE_SELECTED : FEATURE_UNSELECTED}`}
                  onClick={() => toggleFeature(feature)}
                >
                  {feature}
                </button>
              ))}
            </div>
            <FieldError message={error} />
          </div>
        );
      }}
    </form.Field>
  );
}
