"use client";
import Cart from "@/components/layout/Cart";
import Collection from "@/components/ui/Collection";
import Mangas from "@/components/ui/Mangas";
import ProductList from "@/components/ui/ProductList";
import Welcome from "@/components/ui/Welcome";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import Link from "next/link";
import { FaArrowRightLong, FaTag } from "react-icons/fa6";
import { useCountry } from "@/app/contexts/CountryContext";
import { useEffect, useState } from "react";
import Loading from "../loading";
import { useFeaturedProducts } from "@/app/hooks/useFeaturedProducts";

export default function Client() {
  const { country, setCountry } = useCountry();
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer les produits en vedette (plus récents et en stock en priorité)
  const { products: featuredProducts, loading: productsLoading, error: productsError } = useFeaturedProducts(12);
  console.log('Pays: %d', country)
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

  // Filtrer les produits en promotion (afficher toutes les promotions, même expirées)
  const promotionalProducts = featuredProducts.filter(product => product.is_on_sale);
  const regularProducts = featuredProducts.filter(product => !product.is_on_sale).slice(0, 8);

  return (
    <div>
      <Cart />
      <Welcome />
      <Collection />

      {/* Section Promotions */}
      {promotionalProducts.length > 0 && (
        <div className="w-full md:w-3/4 mx-auto mb-12">
          <div className="flex justify-between px-4 mb-4">
            <div className="flex items-center gap-2">
              <h1 className="md:text-2xl text-xl font-bold text-red-600"> Promotions spéciales</h1>
              <FaTag className="text-red-500 text-xl" />
            </div>
            <span className="bg-red-500 text-white text-center px-3 py-1 rounded-full md:text-sm text-xs font-bold animate-pulse">
              -{promotionalProducts.length > 0 ? Math.max(...promotionalProducts.map(p => p.discount_percentage || 0)) : 0}% max
            </span>
          </div>
          <ProductList products={promotionalProducts} />
        </div>
      )}

      {/* Section Produits en vedette */}
      <div className="w-full md:w-3/4 mx-auto">
        <div className="flex justify-between px-4 max-md:px-1">
          <div className="flex items-center gap-2">
            <h1 className="md:text-2xl text-lg font-bold">Produits en vedette</h1>
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              Nouveautés
            </span>
          </div>

          <Link
            href={"/client/recherche?query=*"}
            className="flex items-center gap-2 hover:text-primary hover:translate-x-2 transition-colors duration-200 group max-md:text-xs"
          >
            Voir plus{" "}
            <FaArrowRightLong className="pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto inline-block group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
        {productsLoading ? 
          <div className="w-full flex justify-center items-center h-20">
            <div className="loading loading-spinner loading-lg text-primary text-center"></div>
          </div> : 
          <ProductList products={regularProducts} />
        }
      </div>

      <Mangas />
    </div>
  );
}
