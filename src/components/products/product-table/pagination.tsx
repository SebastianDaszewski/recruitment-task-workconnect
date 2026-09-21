import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  return (
    <nav className="flex items-center gap-0.5" aria-label="Paginacja produktów">
      <button
        type="button"
        className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent py-2 pr-2.5 pl-1.5 text-sm font-medium text-catalog-dark disabled:cursor-default disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft className="size-4" aria-hidden="true" /> Wstecz
      </button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          className={`h-8 w-8 cursor-pointer rounded-md border-0 bg-transparent text-sm font-medium text-catalog-dark ${pageNumber === page ? 'catalog-page-number-active' : ''}`}
          onClick={() => onPageChange(pageNumber)}
          aria-current={pageNumber === page ? 'page' : undefined}
        >
          {pageNumber}
        </button>
      ))}
      <button
        type="button"
        className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent py-2 pr-1.5 pl-2.5 text-sm font-medium text-catalog-dark disabled:cursor-default disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pageCount}
      >
        Dalej <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
