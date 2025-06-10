"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { products } from "@/app/product";
import Image from "next/image";
import { FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";
import Product from "@/components/ui/Product";
import { VariantType, productType } from "@/app/types/types";
import { StaticImageData } from "next/image";
import { useCart } from "@/app/contexts/CartContext";
import { useCountry } from "@/app/contexts/CountryContext";

export default function ProductDetails() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const [product, setProduct] = useState<productType | null>(null);
  const [similarProducts, setSimilarProducts] = useState<productType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false); //Vérifie si le produit est ajouté au panier
  // États pour gérer les variations
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, VariantType>
  >({});
  const [currentImage, setCurrentImage] = useState<string | StaticImageData>();
  const [currentPrice, setCurrentPrice] = useState<number | undefined>();
  const [isInStock, setIsInStock] = useState<number | undefined>(undefined);
  const {country,setCountry} = useCountry()

  const { addToCart } = useCart();
  useEffect(() => {
    const foundProduct = products.find((p) => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      // Handle both single image and array of images
      const firstImage = Array.isArray(foundProduct.imgSrc) 
        ? foundProduct.imgSrc[0] 
        : foundProduct.imgSrc;
      setCurrentImage(firstImage);
      setCurrentPrice(foundProduct.price);
      setIsInStock(foundProduct.stock);
    }
    setLoading(false);
  }, [id]);

  // Initialiser les variations par défaut au chargement
  useEffect(() => {
    if (product?.variations) {
      const defaultVariants: Record<string, VariantType> = {};

      product.variations.forEach((variation) => {
        // Sélectionner la première variante par défaut pour chaque option
        if (variation.variants.length > 0) {
          defaultVariants[variation.name] = variation.variants[0];
        }
      });

      setSelectedVariants(defaultVariants);
    }
  }, [product]);

  // Mettre à jour l'image et le prix quand la sélection change
  useEffect(() => {
    if (!product) return;

    // Par défaut, utiliser l'image et le prix du produit
    let newImage = product.imgSrc;
    let newPrice = product.price;
    let newStockStatus = product.stock;

    // Vérifier si une variante sélectionnée a une image ou un prix spécifique
    Object.values(selectedVariants).forEach((variant) => {
      if (variant.imgSrc) {
        newImage = variant.imgSrc;
      }
      if (variant.price !== undefined) {
        newPrice = variant.price;
      }
      if (variant.stock !== undefined) {
        newStockStatus = variant.stock;
      }
    });

    setCurrentImage(newImage);
    setCurrentPrice(newPrice);
    setIsInStock(newStockStatus);
  }, [selectedVariants, product]);

  //Recupérer le pays
  useEffect(()=>{
    const country = localStorage.getItem('country')
    if(country){
      setCountry(country)
    }
  },[])
  // Rechercher des produits similaires lorsque le produit est chargé
  useEffect(() => {
    if (product) {
      const similar = products
        .filter(
          (p) =>
            p.id !== id &&
            (p.cathegory === product.cathegory || p.manga === product.manga) && p.pays === country
        )
        .slice(0, 4); // Limiter à 4 produits similaires
      setSimilarProducts(similar);
    }
  }, [product, id]);

  // Gérer le changement de variante
  const handleVariantChange = (optionName: string, variant: VariantType) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [optionName]: variant,
    }));

  };

  // Si le produit est en cours de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  // Si le produit n'a pas été trouvé
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold text-error mb-4">
          Produit non trouvé
        </h1>
        <p className="text-gray-600 mb-6">
          Désolé, nous n'avons pas trouvé le produit que vous recherchez.
        </p>
        <a href="/" className="btn btn-primary">
          Retour à l'accueil
        </a>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock) {
      addToCart({
        id,
        title: product.title,
        currentPrice,
        description: product.description,
        currentImage,
      });
      setIsAdded(true);
    } else {
      alert("Quantité maximale atteinte");
    }
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
   
  };

  return (
    <div className=" min-h-screen py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white  overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Image du produit */}
            <div className="flex flex-col justify-center items-center gap-4">
              <Image
                src={currentImage || (Array.isArray(product.imgSrc) ? product.imgSrc[0] : product.imgSrc)}
                alt={product.title}
                width={500}
                height={500}
                className="object-contain"
                priority
              />

              {/* Galerie d'images miniatures si disponible */}
              {Array.isArray(product.imgSrc) && product.imgSrc.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {product.imgSrc.map((img, index) => (
                    <div
                      key={index}
                      className={`w-16 h-16 border-2 cursor-pointer overflow-hidden rounded-md ${
                        currentImage === img
                          ? "border-primary"
                          : "border-gray-200"
                      }`}
                      onClick={() => setCurrentImage(img)}
                    >
                      <Image
                        src={img}
                        alt={`${product.title} - vue ${index + 1}`}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Informations du produit */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.title}
                  </h1>
                  <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm">
                    {product.cathegory}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-2">
                  Manga: {product.manga}
                </p>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    Détails du produit
                  </h2>
                  <p className="text-gray-700">{product.infoProduct}</p>
                </div>
              </div>

              {/* Section variations */}
              {product.variations && product.variations.length > 0 && (
                <div className="mt-4">
                  {product.variations.map((variation) => (
                    <div key={variation.name} className="mb-4">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">
                        {variation.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {variation.variants.map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() =>
                              handleVariantChange(variation.name, variant)
                            }
                            className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                              selectedVariants[variation.name]?.id ===
                              variant.id
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary"
                            }
                              ${
                                !variant.stock
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            disabled={!variant.stock}
                          >
                            {variant.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
              )}

              {/* Prix et bouton d'achat */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4 relative">
                  <div>
                    <span className="text-3xl font-bold text-primary">
                      {currentPrice} XAF
                    </span>
                    {/* Afficher un badge de stock */}
                    <div className="mt-2">
                      {isInStock !== undefined && isInStock > 0 ? (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          En stock
                        </span>
                      ) : (
                        <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Hors stock
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className={`btn gap-2 ${
                      isInStock ? "btn-primary" : "btn-disabled"
                    }`}
                    disabled={!isInStock}
                    onClick={() => handleAddToCart()}
                  >
                    <FaShoppingCart /> Ajouter au panier
                  </button>
                  <div className={`absolute -top-12 right-3 z-50 pointer-events-none opacity-0 transition-all duration-300 ${isAdded ? "opacity-100" : ""}`}>
                    <p className="text-base bg-base-100 p-2 rounded flex items-center border border-base-300">
                      <span className="inline-block mr-2 text-xl bg-green-500 text-white p-2 rounded-full">
                        <FaShoppingCart />
                      </span>
                      Produit ajouté au panier
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <Product
                  key={similarProduct.id}
                  id={Number(similarProduct.id)}
                  imgSrc={Array.isArray(similarProduct.imgSrc) ? similarProduct.imgSrc[0] : similarProduct.imgSrc}
                  alt={similarProduct.title}
                  title={similarProduct.title}
                  description={similarProduct.description}
                  price={similarProduct.price}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
