import React, { useState } from "react";
import { productType, VariationOptionType } from "@/app/types/types";
import { FaEye, FaEdit, FaTrashAlt, FaPlus, FaTimes } from "react-icons/fa";
import { FiCheckCircle, FiImage } from "react-icons/fi";
import Image from "next/image";

interface ProductTableProps {
  product: productType;
  onUpdateProduct: (updatedProduct: productType) => void;
}

interface VariationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  onAddVariation: (variation: VariationOptionType) => void;
  existingVariations: VariationOptionType[];
}

type FormVariant = {
  id: string;
  name: string;
  value: string;
  price: number;
  stock: number;
  image: string;
};

/**
 * Composant modal pour gérer les variations d'un produit
 */
const VariationModal = ({ isOpen, onClose, onAddVariation}: VariationModalProps) => {

  const [variationName, setVariationName] = useState("");
  const [variants, setVariants] = useState<FormVariant[]>([{ 
    id: Date.now().toString(), 
    name: "", 
    value: "", 
    price: 0, 
    stock: 0,
    image: "" 
  }]);
 
  // Fonction pour gérer le téléchargement d'image
  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setVariants(variants.map(v => 
        v.id === id ? { ...v, image: reader.result as string } : v
      ));
    };
    reader.readAsDataURL(file);
  };

  /**
   * Ajoute une nouvelle variante avec des valeurs par défaut
   */
  const handleAddVariant = () => {
    setVariants([...variants, { 
      id: Date.now().toString(), 
      name: "", 
      value: "", 
      price: 0, 
      stock: 0,
      image: ""
    }]);
  };

  /**
   * Met à jour la valeur d'un champ d'une variante spécifique
   */
  const handleVariantChange = (id: string, field: string, value: string | number | File) => {
    // Si c'est un fichier image, on le gère séparément
    if (field === 'image' && value instanceof File) {
      handleImageUpload(id, value);
      return;
    }
    
    // Mise à jour des autres champs
    setVariants(variants.map(v => 
      v.id === id ? { 
        ...v, 
        [field]: field === 'price' || field === 'stock' ? Number(value) : value 
      } : v
    ));
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!variationName.trim()) return;
    
    const newVariation: VariationOptionType = {
      id: Date.now().toString(),
      name: variationName,
      variants: variants.filter(v => v.name && v.value).map(v => ({
        id: v.id,
        name: v.name,
        img_src: v.image,
        price: v.price,
        stock: v.stock
      }))
    };
    
    onAddVariation(newVariation);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Ajouter une variation</h3>
            <button onClick={onClose} className="btn btn-ghost btn-circle">
              <FaTimes />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nom de la variation</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={variationName}
                onChange={(e) => setVariationName(e.target.value)}
                placeholder="Ex: Taille, Couleur, etc."
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Variantes</h4>
                <button type="button" onClick={handleAddVariant} className="btn btn-sm btn-ghost">
                  <FaPlus className="mr-1" /> Ajouter une variante
                </button>
              </div>
              
              {variants.map((variant) => (
                <div key={variant.id} className="grid grid-cols-12 gap-4 items-end mb-4 p-4 bg-gray-50 rounded-lg">
                  {/* Colonne Image */}
                  <div className="col-span-2">
                    <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                      {variant.image ? (
                        <Image 
                          src={variant.image} 
                          alt={`Prévisualisation ${variant.name}`} 
                          className="w-full h-full object-cover"
                          width={96}
                          height={96}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiImage size={24} />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => e.target.files?.[0] && handleVariantChange(variant.id, 'image', e.target.files[0])}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center">Cliquez pour ajouter une image</div>
                  </div>
                  
                  {/* Colonne Nom */}
                  <div className="col-span-3">
                    <input
                      type="text"
                      className="input input-bordered w-full input-sm"
                      placeholder="Nom (ex: Rouge)"
                      value={variant.name}
                      onChange={(e) => handleVariantChange(variant.id, 'name', e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Colonne Valeur */}
                  <div className="col-span-2">
                    <input
                      type="text"
                      className="input input-bordered w-full input-sm"
                      placeholder="Valeur (ex: #FF0000)"
                      value={variant.value}
                      onChange={(e) => handleVariantChange(variant.id, 'value', e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Colonne Prix */}
                  <div className="col-span-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">FCFA</span>
                      <input
                        type="number"
                        className="input input-bordered w-full input-sm pl-12"
                        placeholder="Prix"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  {/* Colonne Stock */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      className="input input-bordered w-full input-sm"
                      placeholder="Stock"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(variant.id, 'stock', e.target.value)}
                      min="0"
                    />
                  </div>
                  
                  {/* Bouton Supprimer */}
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(variant.id)}
                      className="btn btn-ghost btn-sm text-error"
                      disabled={variants.length <= 1}
                      title="Supprimer cette variante"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="btn btn-ghost">
                Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function ProductTable({ product, onUpdateProduct }: ProductTableProps) {

  const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
  
  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
      <td className="p-4">
        <div className="flex items-center">
          <div className="avatar mr-4">
            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
              <Image
                src={product.img_src || "/app/images/default-product.png"}
                alt={product.title}
                className="w-full h-full object-cover"
                width={48}
                height={48}
              />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-800">{product.title}</div>
            <div className="text-sm text-gray-500">ID: {product.id}</div>
          </div>
        </div>
      </td>
      <td className="p-4 text-gray-700 font-medium">
        {product.price.toLocaleString()} FCFA
      </td>
      <td className="p-4">
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
          {product.category}
        </span>
      </td>
      <td className="p-4 text-gray-700">{product.stock} unités</td>
      <td className="p-4 text-gray-700 text-center">
        <span className="cursor-pointer text-accent hover:underline hover:text-primary">
          Cliquez pour voir la description
        </span>
      </td>
      <td className="p-4 text-gray-700 text-center">{product.manga}</td>
      <td className="p-4 text-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FiCheckCircle className="mr-1" /> {product.stock > 0 ?'En stock':'Rupture'}
        </span>
      </td>
      <td className="p-4 text-center">
        <div 
          className="text-blue-600 font-medium hover:text-blue-800 hover:underline cursor-pointer inline-flex items-center"
          onClick={() => setIsVariationModalOpen(true)}
        >
          {product.variations && product.variations.length > 0 ? (
            <>
              <span className="mr-2">{product.variations[0].name}</span>
              <span className="badge badge-ghost">{product.variations[0].variants?.length || 0} variantes</span>
            </>
          ) : (
            <span className="text-gray-400">Ajouter des variations</span>
          )}
        </div>
        
        <VariationModal
          isOpen={isVariationModalOpen}
          onClose={() => setIsVariationModalOpen(false)}
          productId={product.id}
          existingVariations={product.variations || []}
          onAddVariation={(newVariation) => {
            const updatedProduct = {
              ...product,
              variations: [...(product.variations || []), newVariation]
            };
            onUpdateProduct(updatedProduct);
          }}
        />
      </td>
      <td className="p-4 text-right">
        <div className="flex justify-end space-x-2">
          <button className="btn btn-ghost btn-sm btn-square text-blue-600 hover:bg-blue-50">
            <FaEye />
          </button>
          <button className="btn btn-ghost btn-sm btn-square text-yellow-600 hover:bg-yellow-50">
            <FaEdit />
          </button>
          <button className="btn btn-ghost btn-sm btn-square text-red-600 hover:bg-red-50">
            <FaTrashAlt />
          </button>
        </div>
      </td>
    </tr>
  );
}


