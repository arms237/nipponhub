import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./contexts/CartContext";
import { CountryProvider } from "./contexts/CountryContext";
import { AuthProvider } from "./contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NIPPON HUB - Boutique Otaku",
  description:
    "Découvrez notre sélection exclusive de produits otaku et de mangas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <CountryProvider>
            <AuthProvider>{children}</AuthProvider>
          </CountryProvider>
        </CartProvider>
      </body>
    </html>
  );
}
