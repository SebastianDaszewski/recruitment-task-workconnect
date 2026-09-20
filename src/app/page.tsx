import { Suspense } from 'react';
import { ProductCatalog } from '@/components/products/product-catalog';

export default function Home() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-catalog-bg" />}>
      <ProductCatalog />
    </Suspense>
  );
}
