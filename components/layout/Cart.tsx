"use client";
import React, { useState } from "react";
import { BsCart } from "react-icons/bs";
import { FaX } from "react-icons/fa6";

export default function Cart() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <div className="fixed bottom-10 right-10 z-50">
      <button
        className="p-6 shadow btn btn-primary relative"
        onClick={() => setCartOpen(true)}
      >
        <BsCart className="text-xl" />
        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          3
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
              <span className="bg-primary/50 text-primary border border-primary font-semibold px-2 py-1 text-sm rounded-full">
                3 articles
              </span>
            </div>

            <button onClick={() => setCartOpen(false)} className="p-2">
              <FaX />
            </button>
          </div>

          <div className="h-full overflow-y-auto">
            <span><BsCart/></span>
          </div>
        </div>
      </div>
    </div>
  );
}
