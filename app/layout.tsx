import "./globals.css";
import { ReactNode } from "react";
import { Metadata } from "next";
import { cn } from "@/src/lib/utils";

export const metadata: Metadata = {
  title: "Monterrey Beauty Marketplace",
  description: "Marketplace de estilistas en Monterrey",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={cn("min-h-screen bg-gray-50")}>{children}</body>
    </html>
  );
}
