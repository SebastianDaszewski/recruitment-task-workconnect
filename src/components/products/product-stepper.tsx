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
    <div className="flex items-start gap-4 border-b border-catalog-line px-4 py-3 md:items-center" aria-label="Postęp formularza">
      {steps.map(([title, description], index) => {
        const step = index + 1;
        const complete = currentStep > step;
        const active = currentStep >= step;

        return (
          <div className="contents" key={title}>
            {index > 0 ? <div className={`catalog-step-line hidden h-px w-16.75 shrink-0 md:block ${currentStep >= step ? 'bg-catalog-primary' : 'bg-catalog-line'}`} /> : null}
            <div className={`flex min-w-0 flex-1 flex-col items-start gap-3 md:flex-none md:flex-row md:items-center ${active ? 'text-catalog-dark' : 'text-catalog-muted'}`}>
              <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm ${active ? 'bg-catalog-primary text-white' : 'border border-catalog-line bg-catalog-soft text-catalog-muted'}`}>{complete ? '✓' : step}</span>
              <div className="min-w-0"><strong className="block whitespace-nowrap text-sm font-medium">{title}</strong><small className="mt-0.5 block whitespace-nowrap text-xs text-catalog-muted">{description}</small></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}