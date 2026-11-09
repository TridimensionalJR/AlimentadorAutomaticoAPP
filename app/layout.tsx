import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist } from "next/font/google";

import ClientLayout from "@/components/ClientLayout";

import "./globals.css";
import { cn } from "@/lib/utils";

import GoogleProvider from "@/providers/GoogleProvider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tridimensional | Alimentador Aut. para pets",
  description: "Tridimensional | Alimentador Aut. para pets",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={cn("h-full", "antialiased", jakarta.variable, "font-sans", geist.variable)}>
      <body className={`${jakarta.className} min-h-full flex flex-col`}>
        <GoogleProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </GoogleProvider>
        
      </body>
    </html>
  );
}