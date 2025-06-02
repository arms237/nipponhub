"use client";
import React, { useState } from "react";
import { BsCart } from "react-icons/bs";
import { FaX } from "react-icons/fa6";
import { useCart } from "@/app/contexts/CartContext";
import Image from "next/image";

export default function Cart() {
  const [cartOpen, setCartOpen] = useState(false);
  const {cartItems,removeFromCart} = useCart();
  
  return (
    <div className="fixed bottom-10 right-10 z-50">
      <button
        className="p-6 shadow btn btn-primary relative"
        onClick={() => setCartOpen(true)}
      >
        <BsCart className="text-xl" />
        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {cartItems.length}
        </span>
      </button>
      
      <div className={`w-screen fixed  top-0 right-0 h-screen bg-gray-500/50 transition-all duration-400 ${cartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className={`h-full fixed w-screen md:w-1/3 bg-base-100 p-2 ${cartOpen ? "right-0" : "right-[-100%]"} transition-right duration-400`}>
          <div className="flex justify-between border-b border-base-300 pb-3 p-2">
            <div className="flex items-center gap-2 px-2">
              <h1 className="flex justify-center items-center gap-1 text-xl font-bold">
                <BsCart />
                Panier
              </h1>
              <span className="bg-primary/40 text-primary font-medium px-2 py-1 text-xs rounded-full">
              {
                cartItems.length === 0 ? "Aucun article" : `${cartItems.length} article${cartItems.length === 1 ? "" : "s"}`
              }
              </span>
            </div>

            <button onClick={() => setCartOpen(false)} className="p-2">
              <FaX />
            </button>
          </div>

          {cartItems.length === 0 ? <div className="h-[calc(100%-10rem)] overflow-y-auto flex justify-center items-center ">
            <div className="flex flex-col items-center gap-2 text-gray-400">
                <span className="font-bold text-5xl"><BsCart/></span>
                <p className="text-xl font-semibold">Aucun produit dans le panier</p>
            </div>
          </div> : (cartItems.map((item) => {
            return (
              <div key={item.id} className="flex justify-between my-2">
                <div className="flex items-center justify-center gap-2 p-2">
                    <Image
                        src={item.imgSrc}
                        alt={item.alt}
                        width={100}
                        height={100}
                        className="object-cover rounded "
                    />
                </div>
                <p className="text-xl">{item.title}</p>
                <p className="text-xl font-semibold">{item.price} FCFA</p>
                <button onClick={()=>removeFromCart(item)} className="btn btn-error">Supprimer</button>
              </div>
            );
          }))}
          <div className="p-2">
            <div className="flex justify-between">
                <p className="text-xl font-semibold">Total:</p>
                <p className="text-xl font-semibold">{cartItems.reduce((total, item) => total + item.price, 0)} FCFA</p>
            </div>
            <button className="btn btn-primary w-full">Commander</button>
          </div>
        </div>
      </div>
    </div>
  );
}
