import React from "react";
import { Metadata } from "next";
import Filter from "@/components/layout/Filter";
import { FilterProvider } from "@/app/contexts/FilterContext";

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
    <div>
      <main className="flex max-lg:flex-col">{children}</main>
    </div>
  );
}
