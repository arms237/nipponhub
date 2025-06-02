import React from 'react'
import { motion } from 'framer-motion'

export default function TitleCategory({title}: {title: string}) {
  return (
    <motion.div 
      className="container mx-auto px-4 pt-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">{title}</h1>
        <div className="w-24 h-1 bg-primary mx-auto"></div>
      </div>
      </motion.div>

  )
}
