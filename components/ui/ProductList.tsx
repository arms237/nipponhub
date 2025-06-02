'use client'
import React, { useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from 'react-intersection-observer';
import { productType } from "@/app/types/types";
import Product from "./Product";
import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";

export default function ProductList({ products }: { products: productType[];}) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      } 
    }
  };

  useEffect(() => {
    if (inView) {
      controls.start("show");
    }
  }, [controls, inView]);

  return (
    <div ref={ref} className="flex flex-col justify-center gap-4 md:w-3/4 w-full mx-auto">
      

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 cursor-pointer m-auto mt-8"
        variants={container}
        initial="hidden"
        animate={controls}
      >
        {products.map((product) => (
          <motion.div variants={item} key={product.id}>
            <Product
              id={Number(product.id)}
              imgSrc={product.imgSrc[0]}
              alt={product.title}
              title={product.title}
              description={product.description}
              price={product.price}
              stock={product.stock}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
