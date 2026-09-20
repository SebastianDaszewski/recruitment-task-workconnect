import type { Product } from '@/features/products/types';

type ProductTableProps = {
  products: Product[];
  page: number;
  pageCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

const columns = ['Nazwa', 'SKU', 'Kategoria', 'Cena Brutto', 'Status', 'Magazyn'];

function StatusBadge({ available }: { available: boolean }) {
  return (
    <span className={`inline-flex min-h-5 items-center rounded-full px-2 text-xs font-medium ${available ? 'bg-catalog-green-bg text-catalog-green' : 'bg-catalog-red-bg text-catalog-red'}`}>
      {available ? 'Dostępny' : 'Niedostępny'}
    </span>
  );
}

function ProductTableDesktop({ products, emptyRows, page }: { products: Product[]; emptyRows: number; page: number }) {
  return (
    <div className="overflow-x-auto max-md:hidden">
      <table className="w-full min-w-catalog-table table-fixed border-collapse text-xs">
        <thead className="bg-catalog-table-head text-catalog-muted">
          <tr>
            {columns.map((column) => <th className="h-10 px-4 text-left font-normal" scope="col" key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody className="catalog-table-body">
          {products.map((product) => (
            <tr key={product.sku}>
              <td className="font-medium text-catalog-text">{product.name}</td>
              <td className="text-catalog-muted">{product.sku}</td>
              <td className="text-catalog-muted">{product.category}</td>
              <td className="font-medium text-catalog-text">{product.price}</td>
              <td><StatusBadge available={product.available} /></td>
              <td className="text-catalog-muted">{product.stock ?? '—'}</td>
            </tr>
          ))}
          {Array.from({ length: emptyRows }).map((_, index) => (
            <tr key={`empty-${page}-${index}`} aria-hidden="true"><td colSpan={6} /></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductCardsMobile({ products }: { products: Product[] }) {
  return (
    <div className="hidden flex-col gap-2 max-md:flex">
      {products.map((product) => (
        <article className="min-h-catalog-card rounded-xl border border-catalog-field-border bg-white px-3 pb-3 pt-4" key={product.sku}>
          <div className="flex items-start justify-between gap-2.5">
            <div>
              <h2 className="m-0 text-base font-medium leading-tight">{product.name}</h2>
              <p className="mt-1.5 text-xs leading-none text-catalog-muted">{product.sku}</p>
            </div>
            <span className="mt-2"><StatusBadge available={product.available} /></span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-catalog-panel px-3 pb-3 pt-3.5">
            <div className="flex min-w-0 flex-col gap-2"><span className="text-xs leading-none text-catalog-muted">Kategoria</span><strong className="truncate text-sm font-normal leading-none">{product.category}</strong></div>
            <div className="flex min-w-0 flex-col gap-2"><span className="text-xs leading-none text-catalog-muted">Cena brutto</span><strong className="truncate text-sm font-normal leading-none">{product.price}</strong></div>
            <div className="flex min-w-0 flex-col gap-2"><span className="text-xs leading-none text-catalog-muted">Magazyn</span><strong className="truncate text-sm font-normal leading-none">{product.stock ?? '—'}</strong></div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Pagination({ page, pageCount, onPageChange }: Pick<ProductTableProps, 'page' | 'pageCount' | 'onPageChange'>) {
  return (
    <nav className="flex items-center gap-1 max-md:w-full max-md:justify-between" aria-label="Paginacja produktów">
      <button type="button" className="inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent px-2.5 py-2 text-catalog-text disabled:cursor-default disabled:text-catalog-disabled" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
        <span className="text-xl leading-3 text-catalog-arrow" aria-hidden="true">‹</span> Wstecz
      </button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
        <button key={pageNumber} type="button" className={`h-8 w-8 cursor-pointer rounded-md border-0 bg-transparent text-catalog-text ${pageNumber === page ? 'catalog-page-number-active' : ''}`} onClick={() => onPageChange(pageNumber)} aria-current={pageNumber === page ? 'page' : undefined}>{pageNumber}</button>
      ))}
      <button type="button" className="inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent px-2.5 py-2 text-catalog-text disabled:cursor-default disabled:text-catalog-disabled" onClick={() => onPageChange(page + 1)} disabled={page === pageCount}>
        Dalej <span className="text-xl leading-3 text-catalog-arrow" aria-hidden="true">›</span>
      </button>
    </nav>
  );
}

export function ProductTable({ products, page, pageCount, totalCount, onPageChange }: ProductTableProps) {
  return (
    <section className="mx-auto max-w-7xl overflow-hidden rounded-lg border border-catalog-border bg-white shadow-sm max-md:overflow-visible max-md:border-0 max-md:bg-transparent max-md:shadow-none" aria-label="Lista produktów">
      <ProductTableDesktop products={products} emptyRows={5 - products.length} page={page} />
      <ProductCardsMobile products={products} />
      <footer className="flex min-h-16 items-center justify-between px-4 text-xs text-catalog-muted max-md:flex-col max-md:gap-4 max-md:px-0 max-md:pt-6">
        <span>Strona {page} z {pageCount} · {totalCount} produktów</span>
        <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
      </footer>
    </section>
  );
}