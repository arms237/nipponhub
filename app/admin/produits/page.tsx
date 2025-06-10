"use client";
import { productType, VariantType } from "@/app/types/types";
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

export default function Produits() {
  const [products, setProducts] = useState<productType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<productType | null>(
    null
  );
  const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
  const [currentProductForVariation, setCurrentProductForVariation] =
    useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [formData, setFormData] = useState<productType>({
    id: "",
    title: "",
    description: "",
    price: 0,
    manga: "",
    imgSrc: "",
    cathegory: "",
    subCathegory: "",
    infoProduct: "",
    stock: 0,
    variations: [],
    pays: "",
  });

  const pays= ['Cameroun','Gabon']
  // Catégories principales extraites de la Navbar
  const categories = [
    {
      name: "Figurines",
      hasSubmenu: false,
    },
    {
      name: "Décorations",
      hasSubmenu: true,
      subcategories: ["Stickers", "Posters", "Veilleuses"],
    },
    {
      name: "Vêtements",
      hasSubmenu: true,
      subcategories: ["T-shirts", "Pulls", "Vestes", "Accessoires"],
    },
    {
      name: "Bijoux",
      hasSubmenu: true,
      subcategories: ["Colliers", "Bracelets", "Bagues", "Boucles d'oreilles"],
    },
    {
      name: "Accessoires",
      hasSubmenu: true,
      subcategories: ["Sacs", "Porte-clés", "Cartes", "Objets de collection"],
    },
  ];

  // Tableau plat des catégories pour le select
  const cathegory = categories.map((cat) => cat.name);

  // État pour stocker les sous-catégories disponibles
  const [availableSubcategories, setAvailableSubcategories] = useState<
    string[]
  >([]);

  // Mettre à jour les sous-catégories disponibles quand la catégorie change
  useEffect(() => {
    if (formData.cathegory) {
      const selectedCategory = categories.find(
        (cat) => cat.name === formData.cathegory
      );
      if (selectedCategory?.hasSubmenu && selectedCategory.subcategories) {
        setAvailableSubcategories(selectedCategory.subcategories);
        // Réinitialiser la sous-catégorie quand on change de catégorie
        setFormData((prev) => ({ ...prev, subCathegory: "" }));
      } else {
        setAvailableSubcategories([]);
        setFormData((prev) => ({ ...prev, subCathegory: "" }));
      }
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.cathegory]);

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      description: "",
      price: 0,
      manga: "",
      imgSrc: "",
      cathegory: "",
      subCathegory: "",
      infoProduct: "",
      stock: 0,
      variations: [],
      pays: "",
    });
    setEditingProduct(null);
  };

  const addProduct = (product: productType) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (updatedProduct: productType) => {
    setProducts(
      products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const deleteProduct = (productId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      setProducts(products.filter((p) => p.id !== productId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(formData);
    } else {
      addProduct(formData);
    }
    resetForm();
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner un fichier image valide");
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image ne doit pas dépasser 5MB");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        imgSrc: imageUrl,
      });
    }
  };

  const handleEdit = (product: productType) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleView = (product: productType) => {
    alert(
      `Détails du produit: ${product.title}\nDescription: ${product.description}`
    );
  };

  const handleVariationModalOpen = (productId: string) => {
    setCurrentProductForVariation(productId);
    setIsVariationModalOpen(true);
  };

  const handleAddVariation = (productId: string, variation: any) => {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? {
              ...product,
              variations: [...(product.variations || []), variation],
            }
          : product
      )
    );
  };

  // Filtrer les produits
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.manga.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.cathegory === selectedCategory;
    const matchesStatus =
      !selectedStatus ||
      (selectedStatus === "En stock" && product.stock > 0) ||
      (selectedStatus === "Rupture" && product.stock === 0);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const inStockCount = products.filter((p) => p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
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

      {/* Modal du formulaire */}
      {isModalOpen && (
        <div
          className="inset-0 bg-gray-500/50 flex fixed items-center justify-center p-4 z-50"
          onClick={() => {
            setIsModalOpen(false);
            resetForm();
          }}
        >
          <div
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingProduct
                    ? "Modifier le produit"
                    : "Ajouter un nouveau produit"}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="btn btn-ghost btn-circle"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      value={formData.cathegory}
                      onChange={handleInputChange}
                      required
                    >
                      {cathegory.map((cathegory) => (
                        <option key={cathegory} value={cathegory}>
                          {cathegory}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                    {/*Sous-catégorie sélectionnée si il y en a*/}
                {availableSubcategories.length > 0 && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Sous-catégorie</span>
                    </label>
                    <select
                      name="subCathegory"
                      className="select select-bordered w-full"
                      value={formData.subCathegory}
                      onChange={handleInputChange}
                      required={availableSubcategories.length > 0}
                    >
                      <option value="">Sélectionnez une sous-catégorie</option>
                      {availableSubcategories.map((subcat) => (
                        <option key={subcat} value={subcat}>
                          {subcat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
                    value={formData.pays}
                    onChange={handleInputChange}
                    required
                  >
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
                  {formData.imgSrc && (
                    <div className="mt-2">
                      <img
                        src={formData.imgSrc}
                        alt="Prévisualisation"
                        className="w-20 h-20 object-cover rounded"
                      />
                    </div>
                  )}
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
                    onClick={resetForm}
                  >
                    Réinitialiser
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct
                      ? "Modifier le produit"
                      : "Ajouter le produit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
            <option value="Figurines">Figurines</option>
            <option value="Vêtements">Vêtements</option>
            <option value="Accessoires">Accessoires</option>
            <option value="Goodies">Goodies</option>
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
            className={`btn btn-sm ${
              !selectedCategory && !selectedStatus ? "btn-primary" : "btn-ghost"
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
            className={`btn btn-sm ${
              selectedStatus === "En stock" ? "btn-primary" : "btn-ghost"
            } border border-gray-200`}
            onClick={() => setSelectedStatus("En stock")}
          >
            En stock{" "}
            <span className="ml-2 badge badge-ghost">{inStockCount}</span>
          </button>
          <button
            className={`btn btn-sm ${
              selectedStatus === "Rupture" ? "btn-primary" : "btn-ghost"
            } border border-gray-200`}
            onClick={() => setSelectedStatus("Rupture")}
          >
            Rupture{" "}
            <span className="ml-2 badge badge-ghost">{outOfStockCount}</span>
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
              {filteredProducts.map((product) => (
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
                    <span
                      className="cursor-pointer text-accent hover:underline hover:text-primary"
                      onClick={() => handleView(product)}
                    >
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <FiCheckCircle className="mr-1" />
                      {product.stock > 0 ? "En stock" : "Rupture"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div
                      className="text-blue-600 font-medium hover:text-blue-800 hover:underline cursor-pointer inline-flex items-center"
                      onClick={() => handleVariationModalOpen(product.id)}
                    >
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
                        onClick={() => handleView(product)}
                        title="Voir les détails"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-square text-yellow-600 hover:bg-yellow-50"
                        onClick={() => handleEdit(product)}
                        title="Modifier"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-square text-red-600 hover:bg-red-50"
                        onClick={() => deleteProduct(product.id)}
                        title="Supprimer"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Message quand aucun produit */}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center py-12">
                      <FiPackage className="text-4xl text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-500 mb-2">
                        {products.length === 0
                          ? "Aucun produit trouvé"
                          : "Aucun produit ne correspond aux filtres"}
                      </p>
                      <p className="text-sm text-gray-400 mb-4">
                        {products.length === 0
                          ? "Commencez par ajouter votre premier produit"
                          : "Essayez de modifier vos filtres de recherche"}
                      </p>
                      {products.length === 0 && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setIsModalOpen(true)}
                        >
                          <FaPlus className="mr-2" /> Ajouter un produit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Affichage de <span className="font-medium">1</span> à{" "}
              <span className="font-medium">{filteredProducts.length}</span> sur{" "}
              <span className="font-medium">{filteredProducts.length}</span>{" "}
              produits
            </div>
            <div className="join">
              <button className="join-item btn btn-sm btn-ghost" disabled>
                Précédent
              </button>
              <button className="join-item btn btn-sm btn-active">1</button>
              <button className="join-item btn btn-sm btn-ghost" disabled>
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de variation */}
      {isVariationModalOpen && (
        <VariationModal
          isOpen={isVariationModalOpen}
          onClose={() => setIsVariationModalOpen(false)}
          productId={currentProductForVariation}
          onAddVariation={handleAddVariation}
          existingVariations={
            products.find((p) => p.id === currentProductForVariation)
              ?.variations || []
          }
        />
      )}
    </div>
  );
}

interface VariationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  onAddVariation: (productId: string, variation: any) => void;
  existingVariations: any[];
}

function VariationModal({
  isOpen,
  onClose,
  productId,
  onAddVariation,
  existingVariations,
}: VariationModalProps) {
  const [variationName, setVariationName] = useState("");
  const [variants, setVariants] = useState([
    {
      id: Date.now().toString(),
      name: "",
      value: "",
      price: 0,
      stock: 0,
      image: "",
    },
  ]);

  // Fonction pour gérer les changements dans les variantes
  const handleVariantChange = (
    variantId: string,
    field: string,
    value: any
  ) => {
    setVariants(
      variants.map((variant) => {
        if (variant.id === variantId) {
          if (field === "image" && value instanceof File) {
            // Gérer le téléchargement d'image
            const imageUrl = URL.createObjectURL(value);
            return { ...variant, image: imageUrl };
          } else {
            return { ...variant, [field]: value };
          }
        }
        return variant;
      })
    );
  };

  // Fonction pour ajouter une nouvelle variante
  const addVariant = () => {
    const newVariant = {
      id: Date.now().toString(),
      name: "",
      value: "",
      price: 0,
      stock: 0,
      image: "",
    };
    setVariants([...variants, newVariant]);
  };

  // Fonction pour supprimer une variante
  const removeVariant = (variantId: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter((v) => v.id !== variantId));
    }
  };

  // Fonction pour soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des données
    if (!variationName.trim()) {
      alert("Veuillez saisir un nom pour la variation");
      return;
    }

    // Vérifier que toutes les variantes ont un nom
    const invalidVariants = variants.filter((v) => !v.name.trim());
    if (invalidVariants.length > 0) {
      alert("Veuillez saisir un nom pour toutes les variantes");
      return;
    }

    // Créer l'objet variation
    const variation = {
      id: Date.now().toString(),
      name: variationName,
      variants: variants.map((variant) => ({
        ...variant,
        price: Number(variant.price),
        stock: Number(variant.stock),
      })),
    };

    // Ajouter la variation
    onAddVariation(productId, variation);

    // Réinitialiser le formulaire
    setVariationName("");
    setVariants([
      {
        id: Date.now().toString(),
        name: "",
        value: "",
        price: 0,
        stock: 0,
        image: "",
      },
    ]);

    // Fermer le modal
    onClose();
  };

  // Fonction pour réinitialiser le formulaire lors de la fermeture
  const handleClose = () => {
    setVariationName("");
    setVariants([
      {
        id: Date.now().toString(),
        name: "",
        value: "",
        price: 0,
        stock: 0,
        image: "",
      },
    ]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Ajouter une variation</h3>
            <button onClick={handleClose} className="btn btn-ghost btn-circle">
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Nom de la variation
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={variationName}
                onChange={(e) => setVariationName(e.target.value)}
                placeholder="Ex: Taille, Couleur, Modèle, etc."
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-lg">Variantes</h4>
                <button
                  type="button"
                  className="btn btn-sm btn-outline btn-primary"
                  onClick={addVariant}
                >
                  <FaPlus className="mr-1" /> Ajouter une variante
                </button>
              </div>

              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="grid grid-cols-12 gap-4 items-start p-4 bg-gray-50 rounded-lg border"
                  >
                    {/* Colonne Image */}
                    <div className="col-span-12 md:col-span-2">
                      <label className="label">
                        <span className="label-text text-sm">Image</span>
                      </label>
                      <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                        {variant.image ? (
                          <img
                            src={variant.image}
                            alt={`Prévisualisation ${variant.name}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <FiImage size={24} />
                            <span className="text-xs mt-1">Cliquer</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleVariantChange(
                                variant.id,
                                "image",
                                e.target.files[0]
                              );
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Colonne Nom */}
                    <div className="col-span-12 md:col-span-3">
                      <label className="label">
                        <span className="label-text text-sm">Nom *</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Ex: Rouge, Large, Modèle A"
                        value={variant.name}
                        onChange={(e) =>
                          handleVariantChange(
                            variant.id,
                            "name",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>

                    {/* Colonne Valeur */}
                    <div className="col-span-12 md:col-span-2">
                      <label className="label">
                        <span className="label-text text-sm">Valeur</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Ex: #FF0000, XL"
                        value={variant.value}
                        onChange={(e) =>
                          handleVariantChange(
                            variant.id,
                            "value",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {/* Colonne Prix */}
                    <div className="col-span-12 md:col-span-2">
                      <label className="label">
                        <span className="label-text text-sm">Prix (FCFA)</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered w-full"
                        placeholder="0"
                        value={variant.price}
                        onChange={(e) =>
                          handleVariantChange(
                            variant.id,
                            "price",
                            e.target.value
                          )
                        }
                        min="0"
                        step="100"
                      />
                    </div>

                    {/* Colonne Stock */}
                    <div className="col-span-12 md:col-span-2">
                      <label className="label">
                        <span className="label-text text-sm">Stock</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered w-full"
                        placeholder="0"
                        value={variant.stock}
                        onChange={(e) =>
                          handleVariantChange(
                            variant.id,
                            "stock",
                            e.target.value
                          )
                        }
                        min="0"
                      />
                    </div>

                    {/* Bouton Supprimer */}
                    <div className="col-span-12 md:col-span-1 flex items-end">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-error hover:bg-red-50 w-full md:w-auto"
                        disabled={variants.length <= 1}
                        title="Supprimer cette variante"
                        onClick={() => removeVariant(variant.id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Affichage des variations existantes */}
            {existingVariations && existingVariations.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Variations existantes</h4>
                <div className="space-y-2">
                  {existingVariations.map((variation, index) => (
                    <div
                      key={index}
                      className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-blue-800">
                          {variation.name}
                        </span>
                        <span className="text-sm text-blue-600">
                          {variation.variants?.length || 0} variante(s)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-ghost"
              >
                Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                <FaPlus className="mr-2" />
                Enregistrer la variation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
