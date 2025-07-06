"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";
import Product from "@/components/ui/Product";
import { VariantType } from "@/app/types/types";
import { StaticImageData } from "next/image";
import { useCart } from "@/app/contexts/CartContext";
import { useCountry } from "@/app/contexts/CountryContext";
import { useProduct } from "@/app/hooks/useProduct";
import { useSimilarProducts } from "@/app/hooks/useSimilarProducts";
import Loading from "@/app/loading";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import CityBadges from "@/components/ui/CityBadges";
import Link from 'next/link';

export default function ProductDetails() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  
  // Récupérer le produit principal
  const { product, loading: productLoading, error: productError } = useProduct(id);
  
  // Récupérer des produits similaires basés sur la catégorie ou le manga
  const { products: similarProducts, loading: similarLoading } = useSimilarProducts(product, 4);
  
  const [isAdded, setIsAdded] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, VariantType>>({});
  const [currentImage, setCurrentImage] = useState<string | StaticImageData>();
  const [currentPrice, setCurrentPrice] = useState<number | undefined>();
  const [isInStock, setIsInStock] = useState<number | undefined>(undefined);
  const { setCountry } = useCountry();
  const { addToCart } = useCart();

  // Initialiser les variations par défaut au chargement
  useEffect(() => {
    if (product?.variations) {
      const defaultVariants: Record<string, VariantType> = {};

      product.variations.forEach((variation) => {
        if (variation.variants && variation.variants.length > 0) {
          defaultVariants[variation.name] = variation.variants[0];
        }
      });

      setSelectedVariants(defaultVariants);
    }
  }, [product]);

  // Mettre à jour l'image et le prix quand la sélection change
  useEffect(() => {
    if (!product) return;

    let newImage = product.img_src;
    let newPrice = product.price;
    let newStockStatus = product.stock;

    Object.values(selectedVariants).forEach((variant) => {
      if (variant.img_src) {
        newImage = variant.img_src;
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

  // Récupérer le pays
  useEffect(() => {
    const savedCountry = localStorage.getItem('country');
    if (savedCountry) {
      setCountry(savedCountry);
    }
  }, [setCountry]);

  // Gérer le changement de variante
  const handleVariantChange = (optionName: string, variant: VariantType) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [optionName]: variant,
    }));
  };

  // Si le produit est en cours de chargement
  if (productLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Loading />
      </div>
    );
  }

  // Si il y a une erreur
  if (productError) {
    return <ErrorDisplay error={productError} />;
  }

  // Si le produit n'a pas été trouvé
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold text-error mb-4">
          Produit non trouvé
        </h1>
        <p className="text-gray-600 mb-6">
          Désolé, nous n&apos;avons pas trouvé le produit que vous recherchez.
        </p>
        <Link href="/client">Retour &agrave; l&apos;accueil</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (isInStock && isInStock > 0) {
      addToCart(product, selectedVariants);
      setIsAdded(true);
    } else {
      alert("Produit en rupture de stock");
    }
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // Vérifier si la promotion est expirée
  const isPromotionExpired = () => {
    if (!product.is_on_sale || !product.sale_end_date) return false;
    const now = new Date();
    const endDate = new Date(product.sale_end_date);
    return now > endDate;
  };

  const promotionExpired = isPromotionExpired();
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Image du produit */}
            <div className="flex flex-col justify-center items-center gap-4">
              <Image
                src={currentImage || (Array.isArray(product.img_src) ? product.img_src[0] : product.img_src || "/app/images/default-product.png")}
                alt={product.title}
                width={512}
                height={512}
                className="object-contain"
              />

              {/* Galerie d'images miniatures si disponible */}
              {Array.isArray(product.img_src) && product.img_src.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {product.img_src.map((img, index) => (
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
                    {product.category}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-2">
                  Manga: {product.manga}
                </p>

                {/* Affichage des villes disponibles */}
                {product.country && product.available_cities && product.available_cities.length > 0 && (
                  <div className="mb-4">
                    <CityBadges 
                      cityIds={product.available_cities} 
                      country={product.country} 
                    />
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    Détails du produit
                  </h2>
                  <p className="text-gray-700">{product.description}</p>
                </div>
              </div>

              {/* Section variations */}
              {product.variations && product.variations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Options disponibles</h3>
                  {product.variations.map((variation) => (
                    <div key={variation.id} className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">
                        {variation.name}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {variation.variants?.map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => handleVariantChange(variation.name, variant)}
                            className={`px-4 py-2 border rounded-md text-sm transition-colors ${
                              selectedVariants[variation.name]?.id === variant.id
                                ? "border-primary bg-primary text-white"
                                : "border-gray-300 hover:border-primary"
                            }`}
                          >
                            {variant.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Prix et stock */}
              <div className="mb-6">
                {product.is_on_sale && product.original_price && (
                  <div className="mb-2">
                    <p className={`text-lg line-through ${
                      promotionExpired ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {product.original_price.toLocaleString()} FCFA
                    </p>
                    {product.discount_percentage && (
                      <span className={`px-2 py-1 rounded-full text-sm font-bold ${
                        promotionExpired 
                          ? 'bg-gray-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {promotionExpired ? 'Terminée' : `-${product.discount_percentage}%`}
                      </span>
                    )}
                  </div>
                )}
                <div className={`text-3xl font-bold mb-2 ${
                  product.is_on_sale && !promotionExpired ? 'text-red-500' : 'text-primary'
                }`}>
                  {currentPrice?.toLocaleString() || product.price.toLocaleString()} FCFA
                </div>
                {promotionExpired && product.is_on_sale && (
                  <p className="text-sm text-gray-500">
                    Promotion terminée - Prix normal
                  </p>
                )}
              </div>

              {/* Bouton d'ajout au panier */}
              <button
                onClick={handleAddToCart}
                disabled={!isInStock || isInStock <= 0}
                className="btn btn-primary btn-lg w-full mb-4"
              >
                <FaShoppingCart className="mr-2" />
                {isInStock && isInStock > 0 ? "Ajouter au panier" : "Rupture de stock"}
              </button>

              {/* Message de confirmation */}
              {isAdded && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 text-center"
                >
                  Produit ajouté au panier !
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
            {similarLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="flex justify-center items-center">
                  <div className="loading loading-spinner loading-lg text-primary"></div>
                </div>
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarProducts
                .filter(similarProduct => similarProduct.id !== product.id)
                .slice(0, 4)
                .map((similarProduct) => (
                  <Product
                    key={similarProduct.id}
                    id={similarProduct.id}
                    imgSrc={Array.isArray(similarProduct.img_src) ? similarProduct.img_src[0] : similarProduct.img_src || "/app/images/default-product.png"}
                    alt={similarProduct.title}
                    title={similarProduct.title}
                    description={similarProduct.description}
                    price={similarProduct.price}
                    stock={similarProduct.stock}
                    original_price={similarProduct.original_price}
                    discount_percentage={similarProduct.discount_percentage}
                    is_on_sale={similarProduct.is_on_sale}
                    saleEndDate={similarProduct.sale_end_date}
                  />
                ))}
            </div>
            )}
          </div>
        )}

        {/* Message si aucun produit similaire trouvé */}
        {!similarLoading && similarProducts.length === 0 && product && (
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Produits similaires</h2>
            <p className="text-gray-600">
              Aucun produit similaire trouvé dans la même catégorie ou le même manga.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
