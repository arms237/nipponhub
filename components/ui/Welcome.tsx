import React from 'react'
import welcomeImg from '@/app/images/welcomeImg.png'
import Image from 'next/image'
import Link from 'next/link'

export default function Welcome() {
  return (
    <div className="w-full bg-gradient-to-br from-red-500 to-orange-500 flex justify-between max-lg:flex-col p-4">
        <div className="flex flex-col items-center justify-center lg:w-[50%]">
            <h1 className='text-5xl font-bold text-white'>Bienvenue sur NipponHub</h1>
            <p className='text-white text-justify lg:w-[80%] m-4'>le QG des passionnés d’anime et de culture japonaise au Cameroun ! Ici, chaque produit raconte une histoire. Que tu sois fan de Naruto, One Piece, Demon Slayer, Jujutsu Kaisen ou Tokyo Revengers, tu trouveras de quoi porter et afficher fièrement ton univers préféré.Découvre notre collection unique de posters A3, parfaits pour personnaliser ta chambre ou ton coin setup. Craque pour nos colliers, bracelets, porte-clés et figurines, soigneusement sélectionnés pour les vrais fans.Des prix accessibles, des produits stylés, et une livraison rapide partout au Cameroun. Rejoins la communauté des otakus qui vivent leur passion à fond. NipponHub, c’est plus qu’une boutique, c’est ton univers.</p>
            <Link href="/figurines" className='btn btn-primary'>Visiter la boutique</Link>
        </div>
        <div className="lg:w-[50%] flex justify-center max-lg:mt-7">
            <Image src={welcomeImg} alt="welcomeImg" width={500} height={500} />
        </div>
    </div>
  )
}
