import React from "react";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedAuthRoute from "../_utils/ProtectedAuthRoute";

export const metadata: Metadata = {
  title: "NIPPON HUB - Auth",
  description:
    "Découvrez notre sélection exclusive de produits otaku et de mangas",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar/>
      <ProtectedAuthRoute>
        {children}
      </ProtectedAuthRoute>
      
      <Footer/>
    </div>
  );
}
