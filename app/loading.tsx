'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import logo from './images/NPH-black  LOGO.png';

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-base-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center gap-6 p-8 max-w-md w-full"
      >
        {/* Logo avec animation de pulsation */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="relative w-32 h-32"
        >
          <Image 
            src={logo} 
            alt="NipponHub Logo" 
            fill 
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Barre de chargement */}
        <div className="w-full max-w-xs bg-base-200 rounded-full h-2.5">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Texte de chargement avec animation */}
        <motion.p 
          className="text-lg font-medium text-center text-base-content"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Chargement de l'univers Nippon...
        </motion.p>

        {/* Icônes animées en bas */}
        <motion.div 
          className="flex gap-4 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[1, 2, 3, 4].map((item) => (
            <motion.div
              key={item}
              className="w-3 h-3 rounded-full bg-primary"
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                delay: item * 0.1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
