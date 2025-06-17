"use client";
import { productType } from "@/app/types/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  FaEdit,
  FaEye,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrashAlt,
} from "react-icons/fa";
import {
  FiCheckCircle,
  FiDollarSign,
  FiGrid,
  FiImage,
  FiLayers,
  FiPackage,
} from "react-icons/fi";
import Loading from "@/app/loading";
import supabase from "@/app/lib/supabaseClient";
import { useAuth } from "@/app/contexts/AuthContext";

export default function Produits() {
  // États de base pour le rendu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [formData, setFormData] = useState<productType>({
    id: "",
    title: "",
    description: "",
    price: 0,
    manga: "",
    imgSrc: null,
    cathegory: "",
    subCathegory: "",
    infoProduct: "",
    stock: 0,
    pays: "",
    variations: [],
    created_at: "",
    updated_at: "",
  })
  const { session } = useAuth()

   const [products, setProducts] = useState<productType[]>([]);

  const categories = [
    {
      name: "Figurines",
    },
    {
      name: "Décorations",
      subcategories: ["Stickers", "Posters", "Veilleuses"],
    },
    {
      name: "Vêtements",
      subcategories: ["T-shirts", "Pulls", "Vestes", "Accessoires"],
    },
    {
      name: "Bijoux",
      subcategories: ["Colliers", "Bracelets", "Bagues", "Boucles d'oreilles"],
    },
    {
      name: "Accessoires",
      subcategories: ["Sacs", "Porte-clés", "Cartes", "Objets de collection"],
    },
  ];
  //Créer un produit 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let imageUrl = formData.imgSrc;

      // Upload de l'image si un nouveau fichier a été sélectionné
      if (formData.imgSrc) {
        const fileExt = formData.imgSrc.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload de l'image
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, formData.imgSrc);

        if (uploadError) throw uploadError;

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl as unknown as File;
      }

      // Préparation des données à insérer
      const productToInsert = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        manga: formData.manga,
        img_src: imageUrl,
        cathegory: formData.cathegory,
        sub_cathegory: formData.subCathegory,
        info_product: formData.infoProduct,
        stock: formData.stock,
        pays: formData.pays,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('products')
        .insert([productToInsert])
        .select()

      if (error) {
        console.error('Erreur lors de l\'insertion:', error)
        alert('Erreur lors de la création du produit')
        return
      }

      // Mise à jour de l'état local
      setProducts(prevProducts => [...prevProducts, data[0]])
      
      // Réinitialisation du formulaire
      setFormData({
        id: "",
        title: "",
        description: "",
        price: 0,
        manga: "",
        imgSrc: null,
        cathegory: "",
        subCathegory: "",
        infoProduct: "",
        stock: 0,
        pays: "",
        variations: [],
        created_at: "",
        updated_at: "",
      })
      setPreviewImage("")
      setIsModalOpen(false)

    } catch (error) {
      console.error('Erreur inattendue:', error)
      alert('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Validation pour le stock
    if (name === 'stock' && Number(value) < 0) {
      alert('Le stock ne peut pas être négatif');
      return;
    }
  
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    // Vérifications
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner un fichier image valide");
      return;
    }
  
    if (file.size > 5 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 5MB");
      return;
    }
  
    // Stocker le fichier dans l'état pour l'uploader plus tard
    setFormData(prev => ({
      ...prev,
      imageFile: file // Ajouter cette propriété à ton type productType
    }));
  
    // Prévisualisation
    setPreviewImage(URL.createObjectURL(file));
  };
  
  //Récupérer les produits
  useEffect(()=>{
    const fetchProducts = async () => {
      const {data, error} = await supabase.from('products').select('*')
      if(error){
        console.error(error)
      }else{
        setProducts(data)
      } 
    }
    fetchProducts()
  },[])
  
  //Mettre a jour les sous catégories disponibles quand la catégorie change
  useEffect(()=>{
    if(formData.cathegory){
      const selectedCategory = categories.find((cat)=>cat.name === formData.cathegory);
      if(selectedCategory?.subcategories){
        setAvailableCategories(selectedCategory.subcategories)
        //Réinitialiser la sous catégorie
        setFormData((prev)=>({...prev, subCathegory: ""}))
      }else{
          setAvailableCategories([])
          setFormData((prev)=>({...prev, subCathegory: ""}))
      }
    }else{
      setAvailableCategories([])
    }
    },[formData.cathegory])
  const pays = ['Cameroun', 'Gabon'];
  const cathegory = categories.map((cat) => cat.name);

  if (loading) {
    return <Loading />;
  }
 
  return (
    <>
      <div className="w-full p-6 bg-gray-50 min-h-screen">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 p-6 bg-white rounded-xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Gestion des Produits
            </h1>
            <p className="text-gray-500">
              Gérez vos produits, stocks et variations
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary mt-4 md:mt-0 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
          >
            <FaPlus className="mr-2" /> Ajouter un produit
          </button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <div className="relative w-full md:w-1/3">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="select select-bordered w-full md:w-1/4"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Toutes les catégories</option>
              {cathegory.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              className="select select-bordered w-full md:w-1/4"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="En stock">En stock</option>
              <option value="Rupture">Rupture</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className={`btn btn-sm ${!selectedCategory && !selectedStatus ? "btn-primary" : "btn-ghost"
                } border border-gray-200`}
              onClick={() => {
                setSelectedCategory("");
                setSelectedStatus("");
              }}
            >
              Tous les produits{" "}
              <span className="ml-2 badge badge-ghost">{products.length}</span>
            </button>
            <button
              className={`btn btn-sm ${selectedStatus === "En stock" ? "btn-primary" : "btn-ghost"
                } border border-gray-200`}
              onClick={() => setSelectedStatus("En stock")}
            >
              En stock{" "}
              <span className="ml-2 badge badge-ghost">
                {products.filter((p) => p.stock > 0).length}
              </span>
            </button>
            <button
              className={`btn btn-sm ${selectedStatus === "Rupture" ? "btn-primary" : "btn-ghost"
                } border border-gray-200`}
              onClick={() => setSelectedStatus("Rupture")}
            >
              Rupture{" "}
              <span className="ml-2 badge badge-ghost">
                {products.filter((p) => p.stock === 0).length}
              </span>
            </button>
          </div>
        </div>

        {/* Tableau des produits */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="p-4 text-left text-gray-500 font-medium">
                    <div className="flex items-center">
                      <FiPackage className="mr-2" /> Produit
                    </div>
                  </th>
                  <th className="p-4 text-left text-gray-500 font-medium">
                    <div className="flex items-center">
                      <FiDollarSign className="mr-2" /> Prix
                    </div>
                  </th>
                  <th className="p-4 text-left text-gray-500 font-medium">
                    <div className="flex items-center">
                      <FiGrid className="mr-2" /> Catégorie
                    </div>
                  </th>
                  <th className="p-4 text-left text-gray-500 font-medium">
                    <div className="flex items-center">
                      <FiLayers className="mr-2" /> Stock
                    </div>
                  </th>
                  <th className="p-4 text-center text-gray-500 font-medium">
                    Description
                  </th>
                  <th className="p-4 text-center text-gray-500 font-medium">
                    Pays
                  </th>
                  <th className="p-4 text-center text-gray-500 font-medium">
                    Manga
                  </th>
                  <th className="p-4 text-center text-gray-500 font-medium">
                    Statut
                  </th>
                  <th className="p-4 text-center text-gray-500 font-medium">
                    Variations
                  </th>
                  <th className="p-4 text-right text-gray-500 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="avatar mr-4">
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                            {product.imgSrc ? (
                              <img
                                src={product.imgSrc}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiImage className="text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {product.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-700 font-medium">
                      {product.price.toLocaleString()} FCFA
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        {product.cathegory}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700">{product.stock} unités</td>
                    <td className="p-4 text-gray-700 text-center">
                      <span className="cursor-pointer text-accent hover:underline hover:text-primary">
                        Voir la description
                      </span>
                    </td>
                    <td className="p-4 text-gray-700 text-center">
                      {product.pays}
                    </td>
                    <td className="p-4 text-gray-700 text-center">
                      {product.manga}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        <FiCheckCircle className="mr-1" />
                        {product.stock > 0 ? "En stock" : "Rupture"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-blue-600 font-medium hover:text-blue-800 hover:underline cursor-pointer inline-flex items-center">
                        {product.variations && product.variations.length > 0 ? (
                          <>
                            <span className="mr-2">
                              {product.variations[0].name}
                            </span>
                            <span className="badge badge-ghost">
                              {product.variations.length} variation(s)
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400">
                            Ajouter des variations
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="btn btn-ghost btn-sm btn-square text-blue-600 hover:bg-blue-50"
                          title="Voir les détails"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-square text-yellow-600 hover:bg-yellow-50"
                          title="Modifier"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-square text-red-600 hover:bg-red-50"
                          title="Supprimer"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Message quand aucun produit */}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center py-12">
                        <FiPackage className="text-4xl text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-500 mb-2">
                          Aucun produit trouvé
                        </p>
                        <p className="text-sm text-gray-400 mb-4">
                          Commencez par ajouter votre premier produit
                        </p>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setIsModalOpen(true)}
                        >
                          <FaPlus className="mr-2" /> Ajouter un produit
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modal de création/édition de produit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Ajouter un nouveau produit</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost btn-circle"
                >
                  <FaTimes />
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Titre du produit</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      className="input input-bordered w-full"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Catégorie</span>
                    </label>
                    <select
                      name="cathegory"
                      className="select select-bordered w-full"
                      required
                      value={formData.cathegory}
                      onChange={handleInputChange}
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {cathegory.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {availableCategories.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Sous-catégorie</span>
                    </label>
                    <select name="subCathegory" className="select select-bordered w-full" required
                    value={formData.subCathegory}
                    onChange={handleInputChange}
                    >
                      <option value="">Sélectionnez une sous-catégorie</option>
                      {availableCategories.map((subcat) => (
                        <option key={subcat} value={subcat}>
                          {subcat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Prix (FCFA)</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="100"
                      className="input input-bordered w-full"
                      required
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Stock disponible</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      min="0"
                      className="input input-bordered w-full"
                      required
                      value={formData.stock}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Manga</span>
                  </label>
                  <input
                    type="text"
                    name="manga"
                    className="input input-bordered w-full"
                    required
                    value={formData.manga}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Pays</span>
                  </label>
                  <select
                    name="pays"
                    className="select select-bordered w-full"
                    required
                    value={formData.pays}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionnez un pays</option>
                    {pays.map((pays) => (
                      <option key={pays} value={pays}>
                        {pays}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Image du produit</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input file-input-bordered w-full"
                    onChange={handleUploadImage}
                  />
                  <div className="mt-2">
                    {/* Prévisualisation de l'image */}
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                      {previewImage ? (
                        <img src={previewImage} alt={formData.title} className="w-full h-full object-cover" />
                      ) : (
                        <FiImage className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    name="description"
                    className="textarea textarea-bordered h-32"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Ajouter le produit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}