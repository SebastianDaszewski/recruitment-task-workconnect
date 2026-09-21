import type { Product } from '@/features/products/types';

import { Pagination } from './pagination';
import { ProductCardsMobile } from './product-cards-mobile';
import { StatusBadge } from './status-badge';

type ProductTableProps = {
  products: Product[];
  page: number;
  pageCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

const columns = ['Nazwa', 'SKU', 'Kategoria', 'Cena Brutto', 'Status', 'Magazyn'];

function ProductTableDesktop({
  products,
  emptyRows,
  page,
}: {
  products: Product[];
  emptyRows: number;
  page: number;
}) {
  return (
    <div className="overflow-x-auto max-md:hidden">
      <table className="w-full min-w-catalog-table table-fixed border-collapse text-sm">
        <thead className="border-b border-catalog-border bg-catalog-table-head text-catalog-muted">
          <tr>
            {columns.map((column) => (
              <th className="h-10 px-4 text-left font-medium" scope="col" key={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="catalog-table-body">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="font-medium text-catalog-text">{product.name}</td>
              <td className="text-xs text-catalog-muted">{product.sku}</td>
              <td className="text-catalog-muted">{product.category}</td>
              <td className="font-medium text-catalog-text">{product.price}</td>
              <td>
                <StatusBadge available={product.available} />
              </td>
              <td className="text-catalog-text">{product.stock ?? '—'}</td>
            </tr>
          ))}
          {Array.from({ length: emptyRows }).map((_, index) => (
            <tr key={`empty-${page}-${index}`} aria-hidden="true">
              <td colSpan={6} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductTable({
  products,
  page,
  pageCount,
  totalCount,
  onPageChange,
}: ProductTableProps) {
  return (
    <section
      className="mx-auto max-w-7xl overflow-visible rounded-lg border-0 bg-transparent shadow-none md:overflow-hidden md:border md:border-catalog-border md:bg-white md:shadow-sm"
      aria-label="Lista produktów"
    >
      <ProductTableDesktop products={products} emptyRows={5 - products.length} page={page} />
      <ProductCardsMobile products={products} />
      <footer className="flex min-h-16 items-center justify-between px-4 text-xs text-catalog-muted max-md:flex-col max-md:gap-4 max-md:px-0 max-md:pt-6 md:rounded-b-lg md:bg-gray-50">
        <span>
          Strona {page} z {pageCount} · {totalCount} produktów
        </span>
        <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
      </footer>
    </section>
  );
}
