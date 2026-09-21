import type { Product } from '@/features/products/types';

import { StatusBadge } from './status-badge';

function CardStat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-xs leading-4 text-catalog-muted">{label}</span>
      <span
        className={`truncate text-sm leading-5 text-catalog-text ${strong ? 'font-medium' : 'font-normal'}`}
      >
        {value}
      </span>
    </div>
  );
}

export function ProductCardsMobile({ products }: { products: Product[] }) {
  return (
    <div className="hidden flex-col gap-2 max-md:flex">
      {products.map((product) => (
        <article
          className="flex flex-col gap-2 rounded-[12px] border border-catalog-field-border bg-white p-3"
          key={product.id}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 className="m-0 truncate text-base leading-6 font-medium text-catalog-text">
                {product.name}
              </h2>
              <p className="m-0 truncate text-xs leading-4 text-catalog-muted">{product.sku}</p>
            </div>
            <StatusBadge available={product.available} />
          </div>
          <div className="flex gap-1 rounded-[9px] bg-catalog-panel p-3">
            <CardStat label="Kategoria" value={product.category} />
            <CardStat label="Cena brutto" value={product.price} strong />
            <CardStat label="Magazyn" value={String(product.stock ?? '—')} />
          </div>
        </article>
      ))}
    </div>
  );
}
