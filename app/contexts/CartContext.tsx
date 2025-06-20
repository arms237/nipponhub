'use client';
import { createContext, useContext, useEffect, useState } from "react";
import { productType, VariantType } from "@/app/types/types";

interface CartItem {
  id: string;
  title: string;
  price: number;
  description: string;
  imgSrc: string;
  quantity: number;
  stock?: number;
  selectedVariants?: Record<string, VariantType>;
  productId: string; // ID du produit de base
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: productType, selectedVariants?: Record<string, VariantType>) => void;
  removeFromCart: (cartItemId: string) => void;
  removeItemCompletely: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  canAddToCart: (product: productType, selectedVariants?: Record<string, VariantType>) => boolean;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  clearCart: () => void;
}

const cartContext = createContext<CartContextType | undefined>(undefined);

export const cartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error("Erreur lors du chargement du panier:", error);
        localStorage.removeItem("cartItems");
      }
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Générer un ID unique pour chaque item du panier
  const generateCartItemId = (product: productType, selectedVariants?: Record<string, VariantType>): string => {
    if (!selectedVariants || Object.keys(selectedVariants).length === 0) {
      return product.id;
    }
    
    // Créer un ID basé sur le produit et les variantes sélectionnées
    const variantString = Object.entries(selectedVariants)
      .map(([key, variant]) => `${key}:${variant.id}`)
      .sort()
      .join('|');
    
    return `${product.id}-${variantString}`;
  };

  // Calculer le prix, le stock et l'image en fonction des variantes sélectionnées
  const getVariantInfo = (product: productType, selectedVariants?: Record<string, VariantType>) => {
    let price = product.price;
    let stock = product.stock;
    let imgSrc = Array.isArray(product.imgSrc) ? product.imgSrc[0] as string : product.imgSrc as string;


    if (selectedVariants && product.variations) {
      Object.values(selectedVariants).forEach((variant) => {
        if (variant.price !== undefined) {
          price = variant.price;
        }
        if (variant.stock !== undefined) {
          stock = variant.stock;
        }
        if (variant.imgSrc) {
          imgSrc = variant.imgSrc;
        }
      });
    }

    return { price, stock, imgSrc };
  };

  const addToCart = (product: productType, selectedVariants?: Record<string, VariantType>) => {
    const { price, stock, imgSrc } = getVariantInfo(product, selectedVariants);
    const cartItemId = generateCartItemId(product, selectedVariants);

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === cartItemId);

      // Vérifier si on peut ajouter une unité supplémentaire
      if (existingItem) {
        // Vérifier si on dépasse le stock disponible
        if (stock !== undefined && existingItem.quantity >= stock) {
          alert(`Désolé, vous avez atteint la quantité maximale disponible en stock (${stock})`);
          return prevItems;
        }

        return prevItems.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Pour un nouvel article, vérifier qu'il y a du stock
      if (stock !== undefined && stock <= 0) {
        alert('Ce produit est actuellement en rupture de stock');
        return prevItems;
      }

      const newCartItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        title: product.title,
        price,
        description: product.description,
        imgSrc: imgSrc,
        quantity: 1,
        stock,
        selectedVariants
      };

      return [...prevItems, newCartItem];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === cartItemId);
      if (!existingItem) return prevItems;

      if (existingItem.quantity > 1) {
        return prevItems.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }

      return prevItems.filter((item) => item.id !== cartItemId);
    });
  };

  const removeItemCompletely = (cartItemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemCompletely(cartItemId);
      return;
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === cartItemId);
      if (!existingItem) return prevItems;

      // Vérifier le stock
      if (existingItem.stock !== undefined && quantity > existingItem.stock) {
        alert(`Désolé, la quantité maximale disponible est ${existingItem.stock}`);
        return prevItems;
      }

      return prevItems.map((item) =>
        item.id === cartItemId
          ? { ...item, quantity }
          : item
      );
    });
  };

  const canAddToCart = (product: productType, selectedVariants?: Record<string, VariantType>): boolean => {
    const { stock } = getVariantInfo(product, selectedVariants);
    const cartItemId = generateCartItemId(product, selectedVariants);
    
    const existingItem = cartItems.find((item) => item.id === cartItemId);
    const currentQuantity = existingItem?.quantity || 0;

    if (stock === undefined) return true; // Pas de limite de stock
    return currentQuantity < stock;
  };

  const getCartTotal = (): number => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = (): number => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <cartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      removeItemCompletely,
      updateQuantity,
      canAddToCart,
      getCartTotal,
      getCartItemCount,
      clearCart
    }}>
      {children}
    </cartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(cartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

    

