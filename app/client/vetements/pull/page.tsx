'use client'
import React from 'react'
import { products } from '@/app/product'
import ProductList from '@/components/ui/ProductList'
const Pull = () => {
  return (
    <div>
      
      <ProductList products={products.filter((product) => product.subCathegory === "pulls")} title="Pulls" />
    </div>
  )
}

export default Pull