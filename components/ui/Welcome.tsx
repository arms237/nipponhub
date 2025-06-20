'use client';
import React, { useEffect, useRef, useState } from 'react';
import welcomeImg from '@/app/images/welcomeImg.png';
import Image from 'next/image';
import Link from 'next/link';

const Welcome = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const fullText = `Le QG des passionnés d'animes et de culture japonaise au Cameroun ! Ici, chaque produit raconte une histoire. Que tu sois fan de Naruto, One Piece, Demon Slayer, Jujutsu Kaisen ou autres, tu trouveras de quoi porter et afficher fièrement ton univers préféré.Découvre notre collection unique de posters A3, parfaits pour personnaliser ta chambre ou ton coin setup. Craque pour nos colliers, bracelets, porte-clés et figurines, soigneusement sélectionnés pour les vrais fans.Des prix accessibles, des produits stylés. Rejoins la communauté des otakus qui vivent leur passion à fond. NipponHub, c'est plus qu'une boutique, c'est ton univers.`;
  const shortText = `Le QG des passionnés d'animes et de culture japonaise au Cameroun ! Ici, chaque produit raconte une histoire. Que tu sois fan de Naruto, One Piece, Demon Slayer, Jujutsu Kaisen ou autres, tu trouveras de quoi porter et afficher fièrement ton univers préféré. Découvre notre collection unique de posters A3, parfaits pour personnaliser ta chambre ou ton coin setup...`;

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          contentRef.current?.classList.add('animate-fadeInUp');
          imageRef.current?.classList.add('animate-fadeInRight');
        }
      });
    }, { threshold: 0.1 });

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="w-full bg-gradient-to-br from-red-500 to-orange-500 flex justify-between items-center max-lg:flex-col px-4 py-12 overflow-hidden"
    >
      <div 
        ref={contentRef}
        className="flex flex-col items-center justify-center lg:w-[50%] opacity-0 translate-y-8 transition-all duration-700"
      >
        <h1 className='text-5xl font-bold text-white m-4 text-center'>
          Bienvenue chez <span className='text-yellow-300'>NipponHub</span>
        </h1>
        {/* Texte responsive avec 'Lire plus' uniquement sur lg et moins */}
        <div className="w-[80%] mb-6">
          {/* lg et moins : texte tronqué + bouton */}
          <p className="text-white text-justify text-lg  block xl:hidden">
            {isExpanded ? fullText : shortText}
            {!isExpanded && (
              <span className="text-yellow-200 font-semibold cursor-pointer ml-2" onClick={() => setIsExpanded(true)}>
                Lire plus
              </span>
            )}
            {isExpanded && (
              <span className="text-yellow-200 font-semibold cursor-pointer ml-2" onClick={() => setIsExpanded(false)}>
                Lire moins
              </span>
            )}
          </p>
          {/* xl et plus : texte complet sans bouton */}
          <p className="text-white text-justify text-lg mb-0 hidden xl:block">
            {fullText}
          </p>
        </div>
        <Link 
          href="/client/figurines" 
          className='btn btn-secondary btn-outline hover:scale-105 transition-transform hover:shadow-lg mb-6'
        >
          Visiter la boutique
        </Link>
      </div>
      
      <div 
        ref={imageRef}
        className="lg:w-[50%] w-full flex justify-center items-center opacity-0 translate-x-8 transition-all duration-700"
      >
        {<Image 
          src={welcomeImg} 
          alt="Personnages d'anime populaires" 
          width={600} 
          height={600}
          className="max-lg:mr-11 max-lg:mt-10 hover:scale-105 transition-transform duration-500"
          priority
        />}
        
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-fadeInRight {
          animation: fadeInRight 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Welcome;
