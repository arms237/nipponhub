'use client';
import { createContext, useContext, useState } from "react";

interface CartContextType {
    cartItems: any[];
    addToCart: (product: any) => void;
    removeFromCart: (product: any) => void;
}

const cartContext = createContext<CartContextType | undefined>(undefined);

export const cartProvider =({children}:{children:React.ReactNode})=>{
    const [cartItems, setCartItems] = useState<any[]>([]);

    const addToCart = (product:any)=>{
        setCartItems((prevItems)=> [...prevItems, product])
    }
    
    const removeFromCart = (product:any)=>{
        setCartItems((prevItems)=> prevItems.filter((item)=>item.id !== product.id))
    }

    return(
        <cartContext.Provider value={{cartItems,addToCart,removeFromCart}}>
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

    

