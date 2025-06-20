"use client";
import React, { useState } from "react";
import { BsCart } from "react-icons/bs";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import { useCart } from "@/app/contexts/CartContext";
import Link from "next/link";

export default function Cart() {
  const [cartOpen, setCartOpen] = useState(false);
  const { 
    cartItems, 
    removeFromCart, 
    removeItemCompletely, 
    updateQuantity,
    getCartTotal,
    getCartItemCount,
    clearCart
  } = useCart();

  const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
    updateQuantity(cartItemId, newQuantity);
  };

  return (
    <div className="fixed bottom-10 right-10 z-50">
      <button
        className="p-6 shadow btn btn-primary relative"
        onClick={() => setCartOpen(true)}
      >
        <BsCart className="text-xl" />
        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {getCartItemCount()}
        </span>
      </button>

      <div
        className={`w-screen fixed top-0 right-0 h-screen bg-gray-500/50 transition-all duration-400 ${
          cartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`h-full fixed w-screen md:w-1/3 bg-base-100 p-2 ${
            cartOpen ? "right-0" : "right-[-100%]"
          } transition-right duration-400`}
        >
          <div className="flex justify-between border-b border-base-300 pb-3 p-2">
            <div className="flex items-center gap-2 px-2">
              <h1 className="flex justify-center items-center gap-1 text-xl font-bold">
                <BsCart />
                Panier
              </h1>
              <span className="bg-primary/40 text-primary font-medium px-2 py-1 text-xs rounded-full">
                {cartItems.length === 0
                  ? "Aucun article"
                  : `${getCartItemCount()} article${
                      getCartItemCount() === 1 ? "" : "s"
                    }`}
              </span>
            </div>

            <button onClick={() => setCartOpen(false)} className="p-2">
              <FaX />
            </button>
          </div>

          <div className="h-[calc(100%-10rem)] overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="h-full flex justify-center items-center">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <span className="font-bold text-5xl">
                    <BsCart />
                  </span>
                  <p className="text-xl font-semibold">
                    Aucun produit dans le panier
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 border border-base-300 rounded-lg"
                  >
                    <img
                      src={item.imgSrc}
                      alt={item.title}
                      className="object-cover rounded w-16 h-16 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {item.title}
                      </h3>
                      
                      {/* Afficher les variantes sélectionnées */}
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {Object.entries(item.selectedVariants).map(([key, variant]) => (
                            <span key={key} className="mr-2">
                              {key}: {variant.name}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-sm font-medium text-primary mt-1">
                        {item.price.toLocaleString()} FCFA
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="btn btn-xs btn-square btn-ghost"
                            disabled={item.quantity <= 1}
                          >
                            <FaMinus />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="btn btn-xs btn-square btn-ghost"
                            disabled={item.stock !== undefined && item.quantity >= item.stock}
                          >
                            <FaPlus />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {(item.price * item.quantity).toLocaleString()} FCFA
                          </span>
                          <button
                            onClick={() => removeItemCompletely(item.id)}
                            className="btn btn-xs btn-ghost text-error"
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      
                      {/* Afficher le stock si limité */}
                      {item.stock !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">
                          Stock: {item.stock} unités
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="p-4 border-t border-base-300">
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-semibold">Total:</p>
                <p className="text-lg font-semibold text-primary">
                  {getCartTotal().toLocaleString()} FCFA
                </p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={clearCart}
                  className="btn btn-outline btn-sm flex-1"
                >
                  Vider le panier
                </button>
                <Link 
                  href='/client/commandes' 
                  className="btn btn-primary btn-sm flex-1"
                  onClick={() => setCartOpen(false)}
                >
                  Commander
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
