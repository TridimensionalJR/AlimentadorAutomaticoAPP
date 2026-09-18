import type { Metadata } from "next";

import ClientLayout from "@/components/ClientLayout";

import "./globals.css";

export const metadata: Metadata = {
  title: "Tridimensional | Alimentador Aut. para pets",
  description: "Tridimensional | Alimentador Aut. para pets",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className='h-full antialiased'
    >
      <body className="min-h-full flex flex-col">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
