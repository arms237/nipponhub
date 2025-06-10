"use client";
import Cart from "@/components/layout/Cart";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Collection from "@/components/ui/Collection";
import Mangas from "@/components/ui/Mangas";
import ProductList from "@/components/ui/ProductList";
import Welcome from "@/components/ui/Welcome";
import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import { products } from "../product";
import { useCountry } from "@/app/contexts/CountryContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "../loading";

export default function Client() {
  const { country, setCountry } = useCountry();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const country = localStorage.getItem("country");
    if (country) {
      setCountry(country);
    }
    setIsLoading(false);
  }, []);

 
  console.log(country);
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Cart />
      <Welcome />
      <Collection />
      <div className="w-3/4 mx-auto">
        <div className="flex justify-between px-4">
          <h1 className="text-2xl font-bold">Figurines</h1>

          <Link
            href={"figurines"}
            className="flex items-center gap-2 hover:text-primary hover:translate-x-2 transition-colors duration-200 group"
          >
            Voir plus{" "}
            <FaArrowRightLong className="pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto inline-block group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        <ProductList products={products} limit={8} />
      </div>

      <Mangas />
      <Footer />
    </div>
  );
}
