import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { StaticImageData } from 'next/image';
import { FaShoppingCart } from 'react-icons/fa';

export default function Product({imgSrc, alt, title, description, price}: {imgSrc: string | StaticImageData, alt: string, title: string, description: string, price: number}) {
  return (
    <Link href={`/product/${title}`} className='pb-2 flex flex-col items-center bg-base-100 border border-base-300 rounded hover:scale-105 transition-transform duration-300'>
      
      <div>
        <Image src={imgSrc} alt={alt} width={300} height={300} className='object-cover rounded'/>
      </div>
      <div className='p-2'>
        <h2>{title}</h2>
        <p>{description}</p>
        <p className='font-bold text-xl text-secondary'>{price} XAF</p>
      </div>
      <button className='btn btn-primary'><FaShoppingCart className='inline-block mr-2'/> Ajouter au panier</button>
    </Link>
  )
}

