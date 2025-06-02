"use client";
import React, { useEffect, useState } from "react";
import ProductList from "@/components/ui/ProductList";
import { products } from "@/app/product";
import { productType } from "@/app/types/types";
import { useFilters } from "@/app/contexts/FilterContext";
import NoProductFound from "@/components/ui/NoProductFound";
import Loading from "@/app/loading";
import TitleCategory from "@/components/ui/TitleCategory";

export default function Bijoux() {
  const [productsList, setProductsList] = useState<productType[]>([]);
  const { maxPrice, isInStock } = useFilters();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let filteredProducts = products.filter(
      (product) => product.cathegory === "bijoux" && product.price <= maxPrice
    );

    if (isInStock) {
      filteredProducts = filteredProducts.filter(
        (product) => product.stock > 0
      );
    }

    setProductsList(filteredProducts);
    setIsLoading(false);
  }, [maxPrice, isInStock]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Loading />
      </div>
    );
  }

  if (productsList.length === 0) {
    return <NoProductFound />;
  }

  return (
    <div className="flex flex-col">
      <TitleCategory title="Nos Bijoux" />
      <ProductList products={productsList} />
      <div className="text-center mt-4">
        <p className="text-gray-600">
          {productsList.length}{" "}
          {productsList.length > 1 ? "bijoux trouvés" : "bijou trouvé"}
        </p>
      </div>
    </div>
  );
}
