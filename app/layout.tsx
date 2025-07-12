import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./contexts/CartContext";
import { CountryProvider } from "./contexts/CountryContext";
import { AuthProvider } from "./contexts/AuthContext";

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
      <body className="font-sans antialiased">
        <CartProvider>
          <CountryProvider>
            <AuthProvider>{children}</AuthProvider>
          </CountryProvider>
        </CartProvider>
      </body>
    </html>
  );
}
