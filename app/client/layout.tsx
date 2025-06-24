import React from "react";
import { Metadata } from "next";
import Filter from "@/components/layout/Filter";
import { FilterProvider } from "@/app/contexts/FilterContext";
import Navbar from "@/components/layout/Navbar";
import Cart from "@/components/layout/Cart";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/app/_utils/ProtectedRoute";

export const metadata: Metadata = {
  title: "NIPPON HUB - shop",
  description:
    "Découvrez notre sélection exclusive de produits otaku et de mangas",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <Navbar/>
      <Cart/>
      <ProtectedRoute>
      <main className="flex max-lg:flex-col w-full">{children}</main>
      </ProtectedRoute>
      <Footer/>
    </div>
  );
}
