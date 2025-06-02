'use client';
import { createContext, useContext, useEffect, useState } from "react";

interface CartContextType {
    cartItems: any[];
    addToCart: (product: any) => void;
    removeFromCart: (product: any) => void;
    removeItemCompletely: (product: any) => void;
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
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: (item.quantity || 1) + 1 }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };
    
    const removeFromCart = (product: any) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem && existingItem.quantity > 1) {
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return prevItems.filter((item) => item.id !== product.id);
        });
    };
    
    const removeItemCompletely = (product: any) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== product.id));
    }

    return(
        <cartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            removeItemCompletely
        }}>
            {children}
        </cartContext.Provider>
    )
}

export function useCart(){
    const context = useContext(cartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

    

