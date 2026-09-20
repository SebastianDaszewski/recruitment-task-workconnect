import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "WorkConnect — Produkty",
  description: "Zarządzanie katalogiem produktów WorkConnect.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className={cn("font-sans", geist.variable)}>
      <body><NuqsAdapter>{children}</NuqsAdapter></body>
    </html>
  );
}
