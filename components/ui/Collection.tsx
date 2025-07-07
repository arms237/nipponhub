'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaArrowRightLong } from 'react-icons/fa6'
import { useInView } from 'react-intersection-observer'
import bagueNaruto from '../../app/images/bagues-naruto.jpg'
import figurineGoku from '../../app/images/figurine-goku.jpg'
import porteCle from '../../app/images/porte-cle.jpg'
import tshirtNaruto from '../../app/images/tshirt-naruto.jpg'
import pullBluelock from '../../app/images/pull-bluelock.jpg'
import bandeau from '../../app/images/bandeau-naruto.jpg'
export default function Collection() {
  const collections = [
    {
      name: "Bijoux",
      href: "/client/bijoux",
      imgSrc: bagueNaruto
    },
    {
      name: "Figurines",
      href: "/client/figurines",
      imgSrc: figurineGoku
    },
    {
      name: "Porte-clés",
      href: "/client/accessoires/cles",
      imgSrc: porteCle
    },
    {
      name: "Pulls",
      href: "/client/vetements/pulls",
      imgSrc: pullBluelock
    },
    {
      name: "T-shirts",
      href: "/client/vetements/t-shirts",
      imgSrc: tshirtNaruto
    },
    {
      name: "Bandeaux",
      href: "/client/autres",
      imgSrc: bandeau
    }
  ]
  // Variantes d'animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  // Hook pour détecter quand la section est visible
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref} className='mt-4 p-2 flex flex-col items-center justify-between md:w-3/4 w-full mx-auto'>
      <motion.div 
        className='flex justify-between items-center w-full m-2 '
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <h2 className='text-2xl max-md:text-lg font-bold'>Collection</h2>
        <Link href="/client/recherche?query=*" className='flex items-center gap-2 hover:text-primary transition-all duration-200 hover:translate-x-2 group max-md:text-xs'>
          Tous nos produits
          <FaArrowRightLong className='pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200'/>
        </Link>
      </motion.div>
      
      <div 
        className='w-full flex justify-center px-4 pb-4 -mx-4  ' 
        style={{
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <motion.div 
          className='flex items-center gap-5 w-max px-4 overflow-x-auto scrollbar-hide' // Conteneur avec largeur minimale
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          {collections.map((collection, index) => (
            <motion.div key={`${collection.name}-${index}`} variants={item}>
              <Link 
                href={collection.href} 
                className='flex flex-col items-center gap-y-2 group hover:scale-105 transition-all duration-300 px-2 py-4'
              >
                <div className='relative w-32 h-32 md:w-40 md:h-40'>
                  <Image 
                    src={collection.imgSrc} 
                    alt={collection.name} 
                    fill
                    sizes="(max-width: 768px) 120px, 160px"
                    className='rounded-full object-cover'
                  />
                </div>
                <p className='text-center group-hover:text-primary group-hover:translate-x-2 transition-all duration-200 whitespace-nowrap'>
                  {collection.name} 
                  <FaArrowRightLong className='inline-block ml-1 opacity-0 group-hover:opacity-100 group-hover:ml-2 transition-all duration-200'/>
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
