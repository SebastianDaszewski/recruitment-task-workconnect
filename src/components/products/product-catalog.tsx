'use client';

import { useEffect, useState } from 'react';
import { useQueryState, parseAsInteger } from 'nuqs';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { initialProducts, pageSize } from '@/features/products/data';
import type { Product } from '@/features/products/types';
import { ProductDialog } from './product-dialog';
import { ProductTable } from './product-table';

export function ProductCatalog() {
  const [products, setProducts] = useState(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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
    if (!showSuccess) return;

    const timeoutId = window.setTimeout(() => setShowSuccess(false), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [showSuccess]);

  const handlePageChange = (nextPage: number) => {
    void setPage(Math.min(Math.max(nextPage, 1), pageCount));
  };

  const handleProductCreated = (product: Product) => {
    setProducts((currentProducts) => [...currentProducts, product]);
    void setPage(1);
    setShowSuccess(true);
  };

  return (
    <main className="min-h-screen bg-catalog-bg px-8 py-catalog-page text-catalog-text max-md:px-4 max-md:py-catalog-mobile-page">
      <header className="mx-auto mb-7 flex max-w-7xl items-start justify-between max-md:mb-6 max-md:gap-3">
        <div>
          <h1 className="m-0 text-xl font-semibold leading-tight">Produkty</h1>
          <p className="mt-2 text-sm leading-normal text-catalog-muted">{products.length} produktów w katalogu</p>
        </div>
        <Button className="h-9 shrink-0 cursor-pointer rounded-full bg-catalog-primary px-catalog-button text-xs font-medium shadow-none hover:bg-catalog-primary-hover max-md:px-catalog-mobile-button" type="button" onClick={() => { setShowSuccess(false); setIsDialogOpen(true); }}>
          <span className="mr-2 text-sm leading-normal" aria-hidden="true">+</span>
          Dodaj produkt
        </Button>
      </header>

      <ProductTable products={visibleProducts} page={currentPage} pageCount={pageCount} totalCount={products.length} onPageChange={handlePageChange} />
      <ProductDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onProductCreated={handleProductCreated} />

      {showSuccess ? <div role="status" className="fixed bottom-6 right-6 z-50 flex min-h-12 w-80 items-center gap-3 rounded-lg border border-catalog-border bg-white px-4 text-sm font-semibold text-catalog-text shadow-lg max-md:bottom-4 max-md:left-4 max-md:right-4 max-md:w-auto"><CircleCheck className="size-5 shrink-0 fill-catalog-green text-white" aria-hidden="true" /><span>Produkt został dodany</span></div> : null}
    </main>
  );
}
