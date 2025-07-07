"use client";
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dblogo from '../../app/images/db-logo.png'
import narutoLogo from '../../app/images/naruto-logo.svg'
import opLogo from '../../app/images/op-logo.png'
import jjkLogo from '../../app/images/jjk-logo.png'
import snkLogo from '../../app/images/snk-logo.png'
import bleachLogo from '../../app/images/bleach logo.png'
const mangasList =[
    {
        name: "Dragon Ball",
        href: "/client/recherche?query=Dragon Ball",
        imgSrc: dblogo
    },
    {
        name: "Naruto",
        href: "/client/recherche?query=Naruto",
        imgSrc: narutoLogo
    },
    {
        name: "One Piece",
        href: "/client/recherche?query=One Piece",
        imgSrc: opLogo
    },
    {
        name: "Jujutsu Kaisen",
        href: "/client/recherche?query=Jujutsu Kaisen",
        imgSrc: jjkLogo
    },
    {
        name: "Attack on Titan",
        href: "/client/recherche?query=Attaque des titans",
        imgSrc: snkLogo
    },
    {
        name: "Bleach",
        href: "/client/recherche?query=Bleach",
        imgSrc: bleachLogo
    },
 
]
const MangaCard = ({ manga, index }: { manga: { name: string, href: string, imgSrc: string }, index: number }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      const currentRef = cardRef.current;
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div 
      ref={cardRef}
      className={`bg-base-100 p-2 border border-base-300 hover:scale-105 transition-transform duration-300 flex items-center justify-center ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
        transitionDelay: `${index * 0.1}s`
      }}
    >
      <Link href={manga.href}>
        <Image src={manga.imgSrc} alt={manga.name} width={250} height={250} className='object-contain'/>
      </Link>
    </div>
  );
};

export default function Mangas() {
  return (
    <div className='w-full md:w-3/4 m-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 rounded mt-5'>
      {mangasList.map((manga, index) => (
        <MangaCard key={index} manga={manga} index={index} />
      ))}
    </div>
  )
}
