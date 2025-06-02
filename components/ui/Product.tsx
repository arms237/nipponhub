import Image from "next/image";
import Link from "next/link";
import React from "react";

import { StaticImageData } from "next/image";
import { FaShoppingCart } from "react-icons/fa";

export default function Product({
  imgSrc,
  alt,
  title,
  description,
  price,
  id,
}: {
  imgSrc: string | StaticImageData;
  alt: string;
  title: string;
  description: string;
  price: number;
  id:number
}) {
  return (
    <Link
      href={`/product/${id}`}
      className="pb-2 flex flex-col items-center bg-base-100 border border-base-300 rounded hover:scale-105 transition-transform duration-300"
    >
      <div >
        <Image
          src={imgSrc}
          alt={alt}
          width={300}
          height={300}
          className="object-cover "
        />
      </div>
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-semibold text-center">{title}</h2>
        <p className="line-clamp-1 text-center w-3/4 text-sm text-gray-600">{description}</p>
      </div>
      <div className='text-center'>
        <p className="font-bold text-xl text-secondary">{price} FCFA</p>
        <button className="btn btn-primary text-center">
          <FaShoppingCart /> Ajouter au panier
        </button>
      </div>
    </Link>
  );
}
