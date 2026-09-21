'use client';

import { useEffect, useState } from 'react';

import { CircleCheck, Plus } from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';

import { Button } from '@/components/ui/button';
import { initialProducts, pageSize } from '@/features/products/data';
import type { Product } from '@/features/products/types';

import { ProductDialog } from './product-dialog';
import { ProductTable } from './product-table';

export function ProductCatalog() {
  const [products, setProducts] = useState(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ key: number; state: 'visible' | 'leaving' } | null>(null);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const pageCount = Math.max(1, Math.ceil(products.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const visibleProducts = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (page !== currentPage) {
      void setPage(currentPage);
    }
  }, [currentPage, page, setPage]);

  useEffect(() => {
    if (toast?.state !== 'visible') return;

    const timeoutId = window.setTimeout(
      () => setToast((current) => (current ? { ...current, state: 'leaving' } : null)),
      4000,
    );
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const handlePageChange = (nextPage: number) => {
    void setPage(Math.min(Math.max(nextPage, 1), pageCount));
  };

  const handleProductCreated = (product: Product) => {
    setProducts((currentProducts) => [...currentProducts, product]);
    void setPage(1);
    setToast((current) => ({ key: (current?.key ?? 0) + 1, state: 'visible' }));
  };

  return (
    <main className="min-h-screen bg-catalog-bg px-8 py-catalog-page text-catalog-text max-md:px-4 max-md:py-catalog-mobile-page">
      <header className="mx-auto mb-7 flex max-w-7xl items-center justify-between max-md:mb-6 max-md:gap-3">
        <div>
          <h1 className="m-0 text-xl leading-7 font-semibold text-catalog-text">Produkty</h1>
          <p className="mt-1 text-sm leading-5 text-catalog-muted">
            {products.length} produktów w katalogu
          </p>
        </div>
        <Button
          className="h-9 shrink-0 cursor-pointer gap-1.5 rounded-full bg-catalog-primary px-4 text-sm font-medium shadow-none hover:bg-catalog-primary-hover"
          type="button"
          onClick={() => {
            setToast(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="size-4" aria-hidden="true" />
          Dodaj produkt
        </Button>
      </header>

      <ProductTable
        products={visibleProducts}
        page={currentPage}
        pageCount={pageCount}
        totalCount={products.length}
        onPageChange={handlePageChange}
      />
      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onProductCreated={handleProductCreated}
      />

      {toast ? (
        <div
          key={toast.key}
          role="status"
          onAnimationEnd={() => {
            if (toast.state === 'leaving') setToast(null);
          }}
          className={`fixed right-6 bottom-6 z-50 flex min-h-12 w-80 items-center gap-3 rounded-lg border border-catalog-border bg-white px-4 text-sm font-semibold text-catalog-text shadow-lg max-md:right-4 max-md:bottom-4 max-md:left-4 max-md:w-auto ${
            toast.state === 'leaving'
              ? 'animate-out duration-200 fade-out-0 fill-mode-forwards slide-out-to-bottom-4'
              : 'animate-in duration-300 fade-in-0 slide-in-from-bottom-4'
          }`}
        >
          <CircleCheck
            className="size-5 shrink-0 fill-catalog-green text-white"
            aria-hidden="true"
          />
          <span>Produkt został dodany</span>
        </div>
      ) : null}
    </main>
  );
}
