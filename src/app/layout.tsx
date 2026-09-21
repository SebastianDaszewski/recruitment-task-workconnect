import './globals.css';

import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Produkty',
  description: 'Zarządzanie katalogiem produktów.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pl" className={cn('font-sans', geist.variable)}>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
