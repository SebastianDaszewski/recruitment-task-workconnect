import { ArrowLeft, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const wizardSteps = [
  { title: 'Informacje', label: 'Dalej' },
  { title: 'Cena', label: 'Dalej' },
  { title: 'Dostępność', label: 'Zapisz produkt' },
] as const;

export function DialogFooter({
  currentStep,
  isValid,
  onBack,
  onPrimary,
}: {
  currentStep: number;
  isValid: boolean;
  onBack: () => void;
  onPrimary: () => void;
}) {
  const step = wizardSteps[currentStep - 1];
  const isLastStep = currentStep === wizardSteps.length;
  return (
    <div className="flex justify-end border-t border-catalog-line bg-neutral-50 p-4">
      {currentStep > 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="mr-auto h-9 cursor-pointer rounded-full px-4"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Wstecz
        </Button>
      ) : null}
      <Button
        type="button"
        onClick={onPrimary}
        className={`h-9 rounded-full bg-catalog-primary px-4 hover:bg-catalog-primary-hover ${isValid ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      >
        {step.label}
        {isLastStep ? null : <ArrowRight className="size-4" aria-hidden="true" />}
      </Button>
    </div>
  );
}
