import React from 'react'
import { motion } from 'framer-motion'

export default function NoProductFound() {
  return (
    <motion.div 
        className="flex flex-col items-center justify-center min-h-[60vh]  bg-base-100 p-8 rounded-lg mx-auto my-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">Aucun produit trouvé</h2>
          <p className="text-gray-600">Aucune figurine ne correspond à vos critères de recherche.</p>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => window.location.reload()}
          >
            Réinitialiser les filtres
          </button>
        </div>
      </motion.div>
  )
}
