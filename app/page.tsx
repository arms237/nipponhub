'use client'

import React from 'react'

import Welcome from '@/components/ui/Welcome';
import Collection from '@/components/ui/Collection';
import ProductList from '@/components/ui/ProductList';
import Mangas from '@/components/ui/Mangas';
import {products} from '@/app/product';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { FaArrowRightLong } from 'react-icons/fa6';    
export default function Home() {
  const [inView, ref] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  return (
    <main>
      <Welcome />
      <Collection />
      <div className='w-3/4 mx-auto'>
      <motion.div 
        className="flex justify-between px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold">Figurines</h1>
       
        <Link href={"figurines"} className="flex items-center gap-2 hover:text-primary hover:translate-x-2 transition-colors duration-200 group" >
          Voir plus <FaArrowRightLong className="pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto inline-block group-hover:translate-x-1 transition-transform duration-200"/>
        </Link>
      </motion.div>
      
         <ProductList products={products} title="Figurines" />
      </div>
     
      <Mangas />
    </main>
  )
}
