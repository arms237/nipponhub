'use client';
import { createContext, useContext, useEffect, useState } from "react";
import { products } from "@/app/product";
import { productType } from "@/app/types/types";

interface CartContextType {
    cartItems: any[];
    addToCart: (product: any) => void;
    removeFromCart: (product: any) => void;
    removeItemCompletely: (product: any) => void;
    canAddToCart: (productId: string, currentQuantity?: number) => boolean;
}

const cartContext = createContext<CartContextType | undefined>(undefined);

export const cartProvider =({children}:{children:React.ReactNode})=>{
    const [cartItems, setCartItems] = useState<any[]>([]);
    
   
    useEffect(()=>{
        const storedCart = localStorage.getItem("cartItems");
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    },[])
    useEffect(()=>{
        localStorage.setItem('cartItems',JSON.stringify(cartItems))
    },[cartItems])
    
    const addToCart = (product: any) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            
            // Vérifier si on peut ajouter une unité supplémentaire
            if (existingItem) {
                // Vérifier si on dépasse le stock disponible
                if (product.stock !== undefined && existingItem.quantity >= product.stock) {
                    alert(`Désolé, vous avez atteint la quantité maximale disponible en stock (${product.stock})`);
                    return prevItems;
                }
                
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: (item.quantity || 1) + 1 }
                        : item
                );
            }
            
            // Pour un nouvel article, vérifier qu'il y a du stock
            if (product.stock !== undefined && product.stock <= 0) {
                alert('Ce produit est actuellement en rupture de stock');
                return prevItems;
            }
            
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };
    
    /**
     * Réduit la quantité d'un produit dans le panier de 1
     * Si la quantité atteint 0, le produit est retiré du panier
     * @param product - Le produit à modifier
     */
    const removeFromCart = (product: any) => {
        setCartItems((prevItems) => {
            // Vérifie si le produit existe dans le panier
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (!existingItem) return prevItems;
              
            // Si la quantité est supérieure à 1, on la décrémente
            if (existingItem.quantity > 1) {
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity - 1 } // Décrémente la quantité
                        : item
                );
            }
            // Si la quantité est de 1, on retire complètement le produit
            return prevItems.filter((item) => item.id !== product.id);
        });
    };
    
    /**
     * Supprime complètement un produit du panier
     * @param product - Le produit à supprimer
     */
    const removeItemCompletely = (product: any) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== product.id));
    };
    
    /**
     * Vérifie si on peut ajouter un produit au panier en fonction du stock disponible
     * @param productId - L'ID du produit à vérifier
     * @param currentQuantity - La quantité qu'on souhaite ajouter (par défaut 1)
     * @returns boolean - true si on peut ajouter le produit, false sinon
     */
    const canAddToCart = (productId: string, currentQuantity: number = 0): boolean => {
        // Trouve le produit dans le panier et dans la liste des produits
        const productInCart = cartItems.find((item: productType) => item.id === productId);
        const product = products.find((p: productType) => p.id === productId);
        
        // Si le produit n'existe pas, on ne peut pas l'ajouter
        if (!product) return false;
        
        // Récupère la quantité actuelle dans le panier (0 si pas encore présent)
        const quantityInCart = (productInCart as productType & { quantity: number })?.quantity || 0;
        // Récupère le stock disponible
        const availableStock = product.stock || 0;
        
        // Vérifie si on peut ajouter la quantité souhaitée sans dépasser le stock
        return (quantityInCart + currentQuantity) < availableStock;
    };

    return(
        <cartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            removeItemCompletely,
            canAddToCart
        }}>
            {children}
        </cartContext.Provider>
    )
}

/**
 * Hook personnalisé pour accéder au contexte du panier
 * @returns Le contexte du panier avec les fonctions et données associées
 * @throws Une erreur si utilisé en dehors d'un CartProvider
 */
export function useCart(){
    const context = useContext(cartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

    

