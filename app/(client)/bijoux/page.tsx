import React from 'react'
import ProductList from '@/components/ui/ProductList'
import { products } from '@/app/product'

export default function Bijoux() {
  return (
    <div>
      <ProductList products={products.filter((product) => product.cathegory === "bijoux")} title="Bijoux" />
    </div>
  )
}
