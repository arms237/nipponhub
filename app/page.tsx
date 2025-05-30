import React from 'react'

import Welcome from '@/components/ui/Welcome';
import Collection from '@/components/ui/Collection';
import ProductList from '@/components/ui/ProductList';
import Mangas from '@/components/ui/Mangas';
import figurineGoku from "./images/figurine-goku.jpg"

const products = [
  {
    id: "1",
    title: "Figurine Goku",
    description: "Figurine Goku",
    price: 10000,
    imgSrc: figurineGoku,
    cathegory: "figurines",
    infoProduct: "",
    manga: "Dragon Ball"
  },
  {
    id: "2",
    title: "Figurine Goku",
    description: "Figurine Goku",
    price: 10000,
    imgSrc: figurineGoku,
    cathegory: "figurines",
    infoProduct: "",
    manga: "Dragon Ball"
  },
  {
    id: "3",
    title: "Figurine Goku",
    description: "Figurine Goku",
    price: 10000,
    imgSrc: figurineGoku,
    cathegory: "figurines",
    infoProduct: "",
    manga: "Dragon Ball"
  },
  {
    id: "4",
    title: "Figurine Goku",
    description: "Figurine Goku",
    price: 10000,
    imgSrc: figurineGoku,
    cathegory: "figurines",
    infoProduct: "",
    manga: "Dragon Ball"
  },
  {
    id: "5",
    title: "Figurine Goku",
    description: "Figurine Goku",
    price: 10000,
    imgSrc: figurineGoku,
    cathegory: "figurines",
    infoProduct: "",
    manga: "Dragon Ball"
  },
  {
    id: "6",
    title: "Figurine Goku",
    description: "Figurine Goku",
    price: 10000,
    imgSrc: figurineGoku,
    cathegory: "figurines",
    infoProduct: "",
    manga: "Dragon Ball"
  },
  {
    id: "7",
    title: "Figurine Goku",
    description: "Figurine Goku",
    price: 10000,
    imgSrc: figurineGoku,
    cathegory: "figurines",
    infoProduct: "",
    manga: "Dragon Ball"
  },
  {
    id: "8",
    title: "Figurine Goku",
    description: "Figurine Goku",
    price: 10000,
    imgSrc: figurineGoku,
    cathegory: "figurines",
    infoProduct: "",
    manga: "Dragon Ball"
  },
]
export default function Home() {
  return (
    <main>
      <Welcome />
      <Collection />
      <ProductList products={products} title="Figurines" />
      <Mangas />
    </main>
  )
}
