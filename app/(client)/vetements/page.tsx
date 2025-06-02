'use client'
import React from 'react'
import { products } from '@/app/product'
import ProductList from '@/components/ui/ProductList'
const Vetements = () => {
  return (
    <div>
      <ProductList products={products.filter((product) => product.cathegory === "vetements")} title="Vetements" />
    </div>
  )
}

export default Vetements