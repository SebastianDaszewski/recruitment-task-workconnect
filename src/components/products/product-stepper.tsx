type ProductStepperProps = {
  currentStep: number;
};

const steps = [
  ['Informacje', 'Dane podstawowe'],
  ['Cena', 'Dane cenowe'],
  ['Dostępność', 'Stany magazynowe'],
];

export function ProductStepper({ currentStep }: ProductStepperProps) {
  return (
    <div
      className="mx-4 flex items-start gap-4 border-t border-b border-catalog-line py-6 md:mx-0 md:items-center md:px-4 md:py-3"
      aria-label="Postęp formularza"
    >
      {steps.map(([title, description], index) => {
        const step = index + 1;
        const complete = currentStep > step;
        const active = currentStep >= step;

        return (
          <div className="contents" key={title}>
            {index > 0 ? (
              <div
                className={`catalog-step-line hidden h-px w-16.75 shrink-0 md:block ${currentStep >= step ? 'bg-catalog-primary' : 'bg-catalog-line'}`}
              />
            ) : null}
            <div
              className={`flex min-w-0 flex-1 flex-col items-start gap-3 md:flex-none md:flex-row md:items-center ${active ? 'text-catalog-dark' : 'text-catalog-muted'}`}
            >
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-full text-sm ${active ? 'bg-catalog-primary text-white' : 'border border-catalog-line bg-catalog-soft text-catalog-muted'}`}
              >
                {complete ? '✓' : step}
              </span>
              <div className="min-w-0">
                <strong className="block text-sm font-medium whitespace-nowrap">{title}</strong>
                <small className="mt-0.5 block text-xs whitespace-nowrap text-catalog-muted">
                  {description}
                </small>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
