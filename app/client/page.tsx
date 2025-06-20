"use client";
import Cart from "@/components/layout/Cart";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Collection from "@/components/ui/Collection";
import Mangas from "@/components/ui/Mangas";
import ProductList from "@/components/ui/ProductList";
import Welcome from "@/components/ui/Welcome";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import { useCountry } from "@/app/contexts/CountryContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "../loading";
import { useRandomProducts } from "@/app/hooks/useRandomProducts";

export default function Client() {
  const { country, setCountry } = useCountry();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Récupérer 8 produits aléatoirement
  const { products: randomProducts, loading: productsLoading, error: productsError } = useRandomProducts(8);

  useEffect(() => {
    const savedCountry = localStorage.getItem("country");
    if (savedCountry) {
      setCountry(savedCountry);
    }
    setIsLoading(false);
  }, [setCountry]);

  if (isLoading) {
    return <Loading />;
  }

  if (productsError) {
    return <ErrorDisplay error={productsError} />;
  }

  return (
    <div>
      <Cart />
      <Welcome />
      <Collection />
      <div className="w-full md:w-3/4 mx-auto">
        <div className="flex justify-between px-4 ">
          <h1 className="text-2xl font-bold">Produits en vedette</h1>

          <Link
            href={"/client/figurines"}
            className="flex items-center gap-2 hover:text-primary hover:translate-x-2 transition-colors duration-200 group"
          >
            Voir plus{" "}
            <FaArrowRightLong className="pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto inline-block group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {productsLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        ) : (
          <ProductList products={randomProducts} />
        )}
      </div>

      <Mangas />
    </div>
  );
}
