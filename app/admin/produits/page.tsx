"use client";
import { productType, VariantType, VariationOptionType } from "@/app/types/types";
import React, { useEffect, useState, useMemo } from "react";
import {
  FaEdit,
  FaEye,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrashAlt,
  FaTag,
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
import { useAdminPagination } from "@/app/hooks/useAdminPagination";
import AdminPagination from "@/components/ui/AdminPagination";
// 1. Importer Image de next/image
import Image from 'next/image';

// Composant Notification simple
function Notification({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  if (!message) return null;
  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
      role="alert">
      <div className="flex items-center gap-4">
        <span>{message}</span>
        <button onClick={onClose} aria-label="Fermer la notification" className="ml-4 text-white font-bold">×</button>
      </div>
    </div>
  );
}

export default function Produits() {
  // États de base pour le rendu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [formData, setFormData] = useState<productType>({
    id: "",
    title: "",
    description: "",
    price: 0,
    original_price: 0,
    discount_percentage: 0,
    is_on_sale: false,
    sale_end_date: "",
    manga: "",
    img_src: "",
    image_file: null,
    category: "",
    sub_category: "",
    info_product: "",
    stock: 0,
    country: "",
    variations: [],
    created_at: "",
    updated_at: "",
  })
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' }>({ message: '', type: 'success' });

  // Pagination avec filtres
  const {
    data: products,
    loading: paginationLoading,
    error: paginationError,
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    refresh: refreshPagination
  } = useAdminPagination<productType>({
    table: 'products',
    pageSize: 10,
    select: `
      *,
      variations (
        id,
        name,
        variants (
          id,
          name,
          price,
          stock,
          img_src
        )
      )
    `,
    orderBy: { column: 'created_at', ascending: false },
    filters: {
      ...(selectedCategory && { category: selectedCategory }),
      ...(selectedStatus && { is_on_sale: selectedStatus === 'promo' ? true : false })
    },
    searchColumn: 'title',
    searchTerm: debouncedSearchTerm
  });
  console.log(paginationError)
  // Mapping pour transformer img_src -> img_src (et pour les variantes)
  const transformedProducts = useMemo(() => (products || []).map(product => ({
    ...product,
    img_src: product.img_src,
    variations: product.variations?.map((variation) => ({
      ...variation,
      variants: variation.variants?.map((variant) => ({
        ...variant
      }))
    }))
  })), [products]);

  const categories = [
    {
      name: "Figurines",
    },
    {
      name: "Décorations",
      subcategories: ["Stickers", "Posters", "Veilleuses", "Katanas"],
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
      subcategories: ["Ongles", "Porte-clés"],
    },
    {
      name: "Autres",
    }
  ];
  //Créer un produit 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (!formData.title) {
      setNotification({ message: 'Le titre est obligatoire.', type: 'error' });
      return;
    }
    if (!formData.category) {
      setNotification({ message: 'La catégorie est obligatoire.', type: 'error' });
      return;
    }
    if (!formData.manga) {
      setNotification({ message: 'Le manga est obligatoire.', type: 'error' });
      return;
    }
    if (formData.price < 0) {
      setNotification({ message: 'Le prix ne peut pas être négatif.', type: 'error' });
      return;
    }
    if (formData.stock < 0) {
      setNotification({ message: 'Le stock ne peut pas être négatif.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      let imageUrl = formData.img_src;
      // Upload de l'image si un nouveau fichier a été sélectionné
      if (formData.image_file) {
        const fileExt = formData.image_file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, formData.image_file);
        if (uploadError) {
          console.error('Erreur upload Supabase:', uploadError);
          setNotification({ message: "Erreur lors de l'upload de l'image : " + uploadError.message, type: 'error' });
          setLoading(false);
          return;
        }
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        imageUrl = publicUrl;
      }
      // Préparation des données à insérer
      const productToInsert = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        original_price: formData.original_price,
        discount_percentage: formData.discount_percentage,
        is_on_sale: formData.is_on_sale,
        sale_end_date: formData.sale_end_date || null,
        manga: formData.manga,
        img_src: imageUrl,
        category: formData.category,
        sub_category: formData.sub_category,
        info_product: formData.info_product,
        stock: formData.stock,
        country: formData.country,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const {error } = await supabase
        .from('products')
        .insert([productToInsert])
        .select();
      if (error) {
        setNotification({ message: 'Erreur lors de la création du produit.', type: 'error' });
        return;
      }
      refreshPagination();
      setNotification({ message: 'Produit créé avec succès !', type: 'success' });
      // Réinitialisation du formulaire
      setFormData({
        id: "",
        title: "",
        description: "",
        price: 0,
        original_price: 0,
        discount_percentage: 0,
        is_on_sale: false,
        sale_end_date: "",
        manga: "",
        img_src: "",
        image_file: null, // reset ici
        category: "",
        sub_category: "",
        info_product: "",
        stock: 0,
        country: "",
        variations: [],
        created_at: "",
        updated_at: "",
      });
      setPreviewImage("");
      setVariationName("");
      setVariants([]);
      setIsModalOpen(false);
    } catch(err) {
      console.error('Erreur inattendue lors de la création du produit:', err);
      setNotification({ message: 'Une erreur inattendue est survenue', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
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
  
    setFormData(prev => ({
      ...prev,
      image_file: file // champ temporaire pour l'upload
    }));
  
    // Prévisualisation
    setPreviewImage(URL.createObjectURL(file));
  };
  const handleShowDescription = (description: string) => {
    alert(description)
  }
  //Récupérer les produits
  useEffect(()=>{
    const fetchProducts = async () => {
      setLoadingProduct(true)
      
      // Test de connexion d'abord
      await testSupabaseConnection();
      
      try {
        // Récupérer les produits avec leurs variations et variantes
        const {data, error} = await supabase
          .from('products')
          .select(`
            *,
            variations (
              id,
              name,
              variants (
                id,
                name,
                price,
                stock,
                img_src
              )
            )
          `)
        
        if(error){
          console.error('Erreur lors de la récupération des produits:', error)
          console.error('Détails de l\'erreur:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
        }else{
          console.log('Données brutes de Supabase:', data);
          // Transformer les données pour correspondre au type productType
          const transformedData = data?.map(product => ({
            ...product,
            img_src: product.img_src, // Transformer img_src en img_src
            infoProduct: product.info_product, // Transformer info_product en infoProduct
            originalPrice: product.original_price, // Transformer original_price en originalPrice
            discountPercentage: product.discount_percentage, // Transformer discount_percentage en discountPercentage
            isOnSale: product.is_on_sale, // Transformer is_on_sale en isOnSale
            saleEndDate: product.sale_end_date, // Transformer sale_end_date en saleEndDate
            sub_category: product.sub_category,
            created_at: product.created_at,
            updated_at: product.updated_at,
            variations: product.variations?.map((variation: VariationOptionType) => ({
              ...variation,
              variants: variation.variants?.map((variant: VariantType & { img_src?: string }) => ({
                ...variant,
                img_src: variant.img_src || variant.img_src || ""
              }))
            }))
          })) || [];
          
          console.log('Produits transformés:', transformedData);
          refreshPagination();
        }
      } catch (err) {
        console.error('Erreur inattendue:', err);
      } finally {
        setLoadingProduct(false)
      }
    }
    fetchProducts()
  },[])
  
  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  //Mettre a jour les sous catégories disponibles quand la catégorie change
  useEffect(()=>{
    if(formData.category){
      const selectedCategory = categories.find((cat)=>cat.name === formData.category);
      if(selectedCategory?.subcategories){
        setAvailableCategories(selectedCategory.subcategories)
        //Réinitialiser la sous catégorie
        setFormData((prev)=>({...prev, sub_category: ""}))
      }else{
          setAvailableCategories([])
          setFormData((prev)=>({...prev, sub_category: ""}))
      }
    }else{
      setAvailableCategories([])
    }
    },[formData.category])
  const countries = ['Cameroun', 'Gabon'];
  const cathegory = categories.map((cat) => cat.name);

  // Fonction pour filtrer les produits
  const filteredProducts = useMemo(() => transformedProducts.filter((product) => {
    // Filtre par recherche (titre, description, manga)
    
    const searchMatch = debouncedSearchTerm === "" || 
      product.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.manga.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    // Filtre par catégorie
    const categoryMatch = selectedCategory === "" || product.category === selectedCategory;

    // Filtre par statut (stock)
    const statusMatch = selectedStatus === "" || 
      (selectedStatus === "En stock" && product.stock > 0) ||
      (selectedStatus === "Rupture" && product.stock === 0);

    return searchMatch && categoryMatch && statusMatch;
  }), [transformedProducts, debouncedSearchTerm, selectedCategory, selectedStatus]);

  // Fonction pour supprimer un produit
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      if (error) {
        setNotification({ message: 'Erreur lors de la suppression du produit.', type: 'error' });
        return;
      }
      refreshPagination();
      setNotification({ message: 'Produit supprimé avec succès !', type: 'success' });
    } catch{
      setNotification({ message: 'Une erreur inattendue est survenue', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // États pour l'édition
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);

  // Ouvrir le modal d'édition avec les données du produit
  const handleEditProduct = (product: productType) => {
    setFormData({ ...product });
    setEditProductId(product.id);
    setIsEditModalOpen(true);
    setPreviewImage(
      typeof product.img_src === 'string' ? product.img_src : ""
    );
  };

  // Fonction pour mettre à jour un produit
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProductId) return;
    setLoading(true);
    try {
      let imageUrl = formData.img_src;
      // Upload de l'image si un nouveau fichier a été sélectionné
      if (formData.image_file) {
        const fileExt = formData.image_file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, formData.image_file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        imageUrl = publicUrl;
      }
      // Calcul automatique du stock si variantes présentes
      let stockToUpdate = formData.stock;
      if (formData.variations && formData.variations.length > 0) {
        stockToUpdate = formData.variations.reduce((total, variation) => {
          if (variation.variants && variation.variants.length > 0) {
            return total + variation.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
          }
          return total;
        }, 0);
      }
      const productToUpdate = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        original_price: formData.original_price,
        discount_percentage: formData.discount_percentage,
        is_on_sale: formData.is_on_sale,
        sale_end_date: formData.sale_end_date || null,
        manga: formData.manga,
        img_src: imageUrl,
        category: formData.category,
        sub_category: formData.sub_category,
        info_product: formData.info_product,
        stock: stockToUpdate,
        country: formData.country,
        updated_at: new Date().toISOString(),
      };
      const {error } = await supabase
        .from('products')
        .update(productToUpdate)
        .eq('id', editProductId)
        .select();
      if (error) {
        console.error('Erreur lors de la modification:', error);
        alert('Erreur lors de la modification du produit');
        return;
      }
      refreshPagination();
      setIsEditModalOpen(false);
      setEditProductId(null);
      setFormData({
        id: "",
        title: "",
        description: "",
        price: 0,
        original_price: 0,
        discount_percentage: 0,
        is_on_sale: false,
        sale_end_date: "",
        manga: "",
        img_src: "",
        image_file: null,
        category: "",
        sub_category: "",
        info_product: "",
        stock: 0,
        country: "",
        variations: [],
        created_at: "",
        updated_at: "",
      });
      setPreviewImage("");
    } catch (error) {
      console.error('Erreur inattendue:', error);
      alert('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Ajout des états pour le modal de variation lié à un produit existant
  const [variationName, setVariationName] = useState("");
  const [variants, setVariants] = useState([
    { id: Date.now().toString(), name: "", price: 0, stock: 0, img_src: "" }
  ]);
  const [targetProduct, setTargetProduct] = useState<productType | null>(null);
  
  // États pour la gestion des variations existantes
  const [isExistingVariationsModalOpen, setIsExistingVariationsModalOpen] = useState(false);
  const [editingVariation, setEditingVariation] = useState<VariationOptionType | null>(null);
  const [isEditVariationModalOpen, setIsEditVariationModalOpen] = useState(false);

  // Gestion de l'ajout d'une variante
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: `temp_${Date.now()}`, name: "", price: 0, stock: 0, img_src: "" }
    ]);
  };

  // Gestion de la modification d'une variante
  const handleVariantChange = (id: string, field: string, value: string | number | File) => {
    if (field === 'img_src' && value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVariants(variants.map(v => v.id === id ? { ...v, img_src: reader.result as string } : v));
      };
      reader.readAsDataURL(value);
      return;
    }
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: field === 'price' || field === 'stock' ? Number(value) : value } : v));
  };

  // Suppression d'une variante
  const handleRemoveVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id));
    }
  };

  // Ouvre le modal pour le produit ciblé
  const openVariationModalForProduct = (product: productType) => {
    setTargetProduct(product);
    setIsVariationModalOpen(true);
    
    // Si le produit a déjà une variation, on l'utilise, sinon on crée un nom par défaut
    if (product.variations && product.variations.length > 0) {
      setVariationName(product.variations[0].name);
    } else {
      setVariationName("Couleur"); // Nom par défaut
    }
    
    setVariants([{ id: Date.now().toString(), name: "", price: 0, stock: 0, img_src: "" }]);
  };

  // Ouvre le modal des variations existantes
  const openExistingVariationsModal = (product: productType) => {
    setTargetProduct(product);
    setIsExistingVariationsModalOpen(true);
  };

  // Fonction pour supprimer une variation
  const handleDeleteVariation = async (variationId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette variation et toutes ses variantes ?")) return;
    
    setLoading(true);
    try {
      // Supprimer d'abord les variantes de cette variation
      const { error: variantsError } = await supabase
        .from('variants')
        .delete()
        .eq('variation_id', variationId);
      
      if (variantsError) {
        console.error('Erreur lors de la suppression des variantes:', variantsError);
        alert('Erreur lors de la suppression des variantes');
        return;
      }

      // Puis supprimer la variation
      const { error: variationError } = await supabase
        .from('variations')
        .delete()
        .eq('id', variationId);
      
      if (variationError) {
        console.error('Erreur lors de la suppression de la variation:', variationError);
        alert('Erreur lors de la suppression de la variation');
        return;
      }

      // Rafraîchir la liste des produits
      const { data: updatedProducts, error } = await supabase
        .from('products')
        .select(`
          *,
          variations (
            id,
            name,
            variants (
              id,
              name,
              price,
              stock,
              img_src
            )
          )
        `)
        .eq('id', targetProduct?.id);

      if (!error && updatedProducts && updatedProducts.length > 0) {
        const transformedProduct = {
          ...updatedProducts[0],
          img_src: updatedProducts[0].img_src,
          infoProduct: updatedProducts[0].info_product,
          sub_category: updatedProducts[0].sub_category,
          created_at: updatedProducts[0].created_at,
          updated_at: updatedProducts[0].updated_at
        };
        
        refreshPagination();
        setTargetProduct(transformedProduct);
        // MAJ stock produit
        if (targetProduct && targetProduct.id) await updateProductStockFromVariants(targetProduct.id);
      }

      alert('Variation supprimée avec succès !');
    } catch (error) {
      console.error('Erreur inattendue:', error);
      alert('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ouvrir le modal d'édition de variation
  const handleEditVariation = (variation: VariationOptionType) => {
    setEditingVariation(variation);
    setVariationName(variation.name);
    setVariants(variation.variants?.map((v: VariantType & { img_src?: string }) => ({
      id: v.id,
      name: v.name,
      price: v.price || 0,
      stock: v.stock || 0,
      img_src: v.img_src || v.img_src || ""
    })) || [{ id: Date.now().toString(), name: "", price: 0, stock: 0, img_src: "" }]);
    setIsEditVariationModalOpen(true);
    setIsExistingVariationsModalOpen(false);
  };

  // Fonction pour sauvegarder les modifications d'une variation
  const handleSaveVariationEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariation || !variationName.trim()) return;
    
    setLoading(true);
    try {
      // Mettre à jour le nom de la variation
      const { error: variationError } = await supabase
        .from('variations')
        .update({ name: variationName })
        .eq('id', editingVariation.id);
      
      if (variationError) {
        console.error('Erreur lors de la mise à jour de la variation:', variationError);
        alert('Erreur lors de la mise à jour de la variation');
        return;
      }

      // Mettre à jour les variantes existantes et ajouter les nouvelles
      const validVariants = variants.filter(v => v.name && v.price >= 0 && v.stock >= 0);
      
      for (const variant of validVariants) {
        if (variant.id.startsWith('temp_')) {
          // Nouvelle variante
          const { error: insertError } = await supabase
            .from('variants')
            .insert([{
              name: variant.name,
              price: variant.price,
              stock: variant.stock,
              img_src: variant.img_src,
              variation_id: editingVariation.id
            }]);
          
          if (insertError) {
            console.error('Erreur lors de l\'ajout de la variante:', insertError);
          }
        } else {
          // Variante existante à mettre à jour
          console.log('Mise à jour de la variante avec id:', variant.id);
          const { error: updateError } = await supabase
            .from('variants')
            .update({
              name: variant.name,
              price: variant.price,
              stock: variant.stock,
              img_src: variant.img_src
            })
            .eq('id', variant.id);
          
          if (updateError) {
            console.error('Erreur lors de la mise à jour de la variante:', updateError);
          }
        }
      }

      // Rafraîchir les données
      const { data: updatedProducts, error } = await supabase
        .from('products')
        .select(`
          *,
          variations (
            id,
            name,
            variants (
              id,
              name,
              price,
              stock,
              img_src
            )
          )
        `)
        .eq('id', targetProduct?.id);

      if (!error && updatedProducts && updatedProducts.length > 0) {
        const transformedProduct = {
          ...updatedProducts[0],
          img_src: updatedProducts[0].img_src,
          infoProduct: updatedProducts[0].info_product,
          sub_category: updatedProducts[0].sub_category,
          created_at: updatedProducts[0].created_at,
          updated_at: updatedProducts[0].updated_at
        };
        
        refreshPagination();
        setTargetProduct(transformedProduct);
        // MAJ stock produit
        if (targetProduct && targetProduct.id) {
          await updateProductStockFromVariants(targetProduct.id);
          // Recharger le produit depuis la base
          const { data: refreshed, error: refreshError } = await supabase
            .from('products')
            .select(`*, variations (id, name, variants (id, name, price, stock, img_src))`)
            .eq('id', targetProduct.id)
            .single();
          if (!refreshError && refreshed) {
            const transformed = {
              ...refreshed,
              img_src: refreshed.img_src,
              infoProduct: refreshed.info_product,
              sub_category: refreshed.sub_category,
              created_at: refreshed.created_at,
              updated_at: refreshed.updated_at,
              variations: refreshed.variations?.map((variation: VariationOptionType) => ({
                ...variation,
                variants: variation.variants?.map((variant: VariantType & { img_src?: string }) => ({
                  ...variant,
                  img_src: variant.img_src || variant.img_src || ""
                }))
              }))
            };
            refreshPagination();
            setTargetProduct(transformed);
            // MAJ stock produit
            if (targetProduct && targetProduct.id) await updateProductStockFromVariants(targetProduct.id);
          }
        }
      }

      setIsEditVariationModalOpen(false);
      setEditingVariation(null);
      alert('Variation modifiée avec succès !');
    } catch (error) {
      console.error('Erreur inattendue:', error);
      alert('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Validation et ajout de la variation au produit ciblé
  const handleAddVariationToExistingProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variationName.trim() || !targetProduct) return;
    
    setLoading(true);
    try {
      let variationId: string;
      
      // Vérifier si une variation existe déjà pour ce produit
      if (targetProduct.variations && targetProduct.variations.length > 0) {
        // Utiliser la variation existante
        variationId = targetProduct.variations[0].id;
        
        // Mettre à jour le nom de la variation si nécessaire
        if (targetProduct.variations[0].name !== variationName) {
          const { error: updateError } = await supabase
            .from('variations')
            .update({ name: variationName })
            .eq('id', variationId);
          
          if (updateError) {
            console.error('Erreur lors de la mise à jour du nom de la variation:', updateError);
          }
        }
      } else {
        // Créer une nouvelle variation
        const { data: variationData, error: variationError } = await supabase
          .from('variations')
          .insert([{
            name: variationName,
            product_id: targetProduct.id
          }])
          .select()
          .single();

        if (variationError) {
          console.error('Erreur lors de la création de la variation:', variationError);
          alert('Erreur lors de la création de la variation');
          return;
        }
        
        variationId = variationData.id;
      }

      // Ajouter les nouvelles variantes
      const validVariants = variants.filter(v => v.name && v.price >= 0 && v.stock >= 0);
      if (validVariants.length > 0) {
        const variantsToInsert = validVariants.map(variant => ({
          name: variant.name,
          price: variant.price,
          stock: variant.stock,
          img_src: variant.img_src,
          variation_id: variationId
        }));

        const { error: variantsError } = await supabase
          .from('variants')
          .insert(variantsToInsert);

        if (variantsError) {
          console.error('Erreur lors de la création des variantes:', variantsError);
          alert('Erreur lors de la création des variantes');
          return;
        }

        // Mettre à jour le stock du produit avec la somme des stocks des variantes
        const totalStock = variantsToInsert.reduce((sum, v) => sum + (v.stock || 0), 0);
        await supabase
          .from('products')
          .update({ stock: totalStock })
          .eq('id', targetProduct.id);
      }

      // Rafraîchir la liste des produits
      const { data: updatedProducts, error } = await supabase
        .from('products')
        .select(`
          *,
          variations (
            id,
            name,
            variants (
              id,
              name,
              price,
              stock,
              img_src
            )
          )
        `)
        .eq('id', targetProduct.id);

      if (!error && updatedProducts && updatedProducts.length > 0) {
        const transformedProduct = {
          ...updatedProducts[0],
          img_src: updatedProducts[0].img_src,
          infoProduct: updatedProducts[0].info_product,
          sub_category: updatedProducts[0].sub_category,
          created_at: updatedProducts[0].created_at,
          updated_at: updatedProducts[0].updated_at,
          variations: updatedProducts[0].variations?.map((variation: VariationOptionType) => ({
            ...variation,
            variants: variation.variants?.map((variant: VariantType & { img_src?: string }) => ({
              ...variant,
              img_src: variant.img_src || variant.img_src || ""
            }))
          }))
        };
        
        refreshPagination();
        setTargetProduct(transformedProduct);
        // MAJ stock produit
        if (targetProduct && targetProduct.id) {
          await updateProductStockFromVariants(targetProduct.id);
          // Recharger le produit depuis la base
          const { data: refreshed, error: refreshError } = await supabase
            .from('products')
            .select(`*, variations (id, name, variants (id, name, price, stock, img_src))`)
            .eq('id', targetProduct.id)
            .single();
          if (!refreshError && refreshed) {
            const transformed = {
              ...refreshed,
              img_src: refreshed.img_src,
              infoProduct: refreshed.info_product,
              sub_category: refreshed.sub_category,
              created_at: refreshed.created_at,
              updated_at: refreshed.updated_at,
              variations: refreshed.variations?.map((variation: VariationOptionType) => ({
                ...variation,
                variants: variation.variants?.map((variant: VariantType & { img_src?: string }) => ({
                  ...variant,
                  img_src: variant.img_src || variant.img_src || ""
                }))
              }))
            };
            refreshPagination();
            setTargetProduct(transformed);
            // MAJ stock produit
            if (targetProduct && targetProduct.id) await updateProductStockFromVariants(targetProduct.id);
          }
        }
      }
      
      setIsVariationModalOpen(false);
      setTargetProduct(null);
      setVariationName("Couleur");
      setVariants([{ id: Date.now().toString(), name: "", price: 0, stock: 0, img_src: "" }]);
      
      alert('Variantes ajoutées avec succès !');
    } catch (error) {
      console.error('Erreur inattendue:', error);
      alert('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Fonction de test pour vérifier la connexion Supabase
  const testSupabaseConnection = async () => {
    try {
      console.log('Test de connexion Supabase...');
      console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Présent' : 'Manquant');
      
      const {error } = await supabase.from('products').select('count');
      if (error) {
        console.error('Erreur de connexion:', error);
      } else {
        console.log('Connexion Supabase OK');
      }
    } catch (err) {
      console.error('Erreur de test:', err);
    }
  };

  // Fonction utilitaire pour mettre à jour le stock total d'un produit selon ses variantes
  const updateProductStockFromVariants = async (productId: string) => {
    // Récupérer toutes les variantes du produit
    const { data: variations, error } = await supabase
      .from('variations')
      .select('id, variants (stock)')
      .eq('product_id', productId);
    if (error) {
      console.error('Erreur lors de la récupération des variations:', error);
      return 0;
    }
    // Calculer la somme des stocks de toutes les variantes
    let totalStock = 0;
    if (variations && variations.length > 0) {
      variations.forEach(variation => {
        if (variation.variants && variation.variants.length > 0) {
          totalStock += variation.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        }
      });
    }
    console.log('Stock total calculé pour le produit', productId, ':', totalStock);
    // Mettre à jour le stock du produit
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: totalStock })
      .eq('id', productId);
    if (updateError) {
      console.error('Erreur lors de la mise à jour du stock du produit:', updateError);
    }
    return totalStock;
  };

  if (loading) {
    return <Loading />;
  }
 
  return (
    <>
      <Notification  message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: 'success' })} />
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
              className={`btn btn-sm ${!selectedCategory && !selectedStatus && !debouncedSearchTerm ? "btn-primary" : "btn-ghost"
                } border border-gray-200`}
              onClick={() => {
                setSelectedCategory("");
                setSelectedStatus("");
                setSearchTerm("");
              }}
            >
              Tous les produits{" "}
              <span className="ml-2 badge badge-ghost">{transformedProducts.length}</span>
            </button>
            <button
              className={`btn btn-sm ${selectedStatus === "En stock" ? "btn-primary" : "btn-ghost"
                } border border-gray-200`}
              onClick={() => setSelectedStatus("En stock")}
            >
              En stock{" "}
              <span className="ml-2 badge badge-ghost">
                {transformedProducts.filter((p) => p.stock > 0).length}
              </span>
            </button>
            <button
              className={`btn btn-sm ${selectedStatus === "Rupture" ? "btn-primary" : "btn-ghost"
                } border border-gray-200`}
              onClick={() => setSelectedStatus("Rupture")}
            >
              Rupture{" "}
              <span className="ml-2 badge badge-ghost">
                {transformedProducts.filter((p) => p.stock === 0).length}
              </span>
            </button>
            {filteredProducts.length !== transformedProducts.length && (
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-gray-600">
                  {filteredProducts.length} résultat(s) sur {transformedProducts.length}
                </span>
                <button
                  className="btn btn-sm btn-ghost text-blue-600"
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedStatus("");
                    setSearchTerm("");
                  }}
                >
                  Effacer les filtres
                </button>
              </div>
            )}
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
                  <th className="p-4 text-center text-gray-500 font-medium">
                    <div className="flex items-center justify-center">
                      <FaTag className="mr-2" /> Promotion
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
              <tbody className="">
                {loadingProduct ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center">
                      <div className="loading loading-spinner loading-lg text-primary"></div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="avatar mr-4">
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                              {product.img_src ? (
                                <Image
                                  src={product.img_src}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                  width={48}
                                  height={48}
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
                      <td className="p-4 text-center">
                        {product.is_on_sale ? (
                          <div className="flex flex-col items-center">
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold mb-1">
                              -{product.discount_percentage}%
                            </span>
                            {product.original_price && (
                              <span className="text-xs text-gray-500 line-through">
                                {product.original_price.toLocaleString()} FCFA
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Aucune</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">{product.stock} unités</td>
                      <td className="p-4 text-gray-700 text-center">
                        <span className="cursor-pointer text-accent hover:underline hover:text-primary" onClick={()=>handleShowDescription(product.description)}>
                          Voir la description
                        </span>
                      </td>
                      <td className="p-4 text-gray-700 text-center">
                        {product.country}
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
                        <div className="text-blue-600 font-medium hover:text-blue-800 hover:underline cursor-pointer inline-flex items-center"
                          onClick={() => {
                            if (product.variations && product.variations.length > 0) {
                              openExistingVariationsModal(product);
                            } else {
                              openVariationModalForProduct(product);
                            }
                          }}>
                          {product.variations && product.variations.length > 0 ? (
                            <>
                              <span className="mr-2">{product.variations[0].name}</span>
                              <span className="badge badge-ghost">
                                {product.variations[0].variants ? product.variations[0].variants.length : 0} variante(s)
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400">Ajouter des variantes</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="btn btn-ghost btn-sm btn-square text-blue-600 hover:bg-blue-50"
                            title="Voir les détails"
                            aria-label="Voir les détails du produit"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm btn-square text-yellow-600 hover:bg-yellow-50"
                            title="Modifier"
                            onClick={() => handleEditProduct(product)}
                            aria-label="Modifier le produit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm btn-square text-red-600 hover:bg-red-50"
                            title="Supprimer"
                            onClick={() => handleDeleteProduct(product.id)}
                            aria-label="Supprimer le produit"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {/* Message quand aucun produit */}
                {!loadingProduct && filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center py-12">
                        <FiPackage className="text-4xl text-gray-300 mb-4" />
                        {transformedProducts.length === 0 ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <p className="text-lg font-medium text-gray-500 mb-2">
                              Aucun résultat trouvé
                            </p>
                            <p className="text-sm text-gray-400 mb-4">
                              Essayez de modifier vos critères de recherche
                            </p>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                setSelectedCategory("");
                                setSelectedStatus("");
                                setSearchTerm("");
                              }}
                            >
                              Effacer les filtres
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {!paginationLoading && (
        <div className="sticky bottom-0 bg-white z-40 shadow pt-2">
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={10}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPrevPage={prevPage}
          />
        </div>
      )}

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
                      name="category"
                      className="select select-bordered w-full"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
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
                    <select name="sub_category" className="select select-bordered w-full" required
                    value={formData.sub_category}
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
                      className={`input input-bordered w-full ${formData.variations && formData.variations.length > 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                      required
                      value={formData.stock}
                      onChange={handleInputChange}
                      readOnly={formData.variations && formData.variations.length > 0}
                      disabled={formData.variations && formData.variations.length > 0}
                    />
                    {formData.variations && formData.variations.length > 0 && (
                      <span className="text-xs text-gray-500 mt-1">Le stock est automatiquement calculé comme la somme des stocks des variantes.</span>
                    )}
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
                    name="country"
                    className="select select-bordered w-full"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionnez un pays</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
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
                        <Image src={previewImage} alt={formData.title} className="w-full h-full object-cover" width={80} height={80} />
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

                {/* Section Promotion */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-orange-600">Gestion des promotions</h3>
                  
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Activer la promotion</span>
                      <input
                        type="checkbox"
                        name="is_on_sale"
                        className="checkbox checkbox-primary"
                        checked={formData.is_on_sale}
                        onChange={(e) => setFormData({
                          ...formData,
                          is_on_sale: e.target.checked
                        })}
                      />
                    </label>
                  </div>

                  {formData.is_on_sale && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Prix original (FCFA)</span>
                        </label>
                        <input
                          type="number"
                          name="original_price"
                          min="0"
                          step="100"
                          className="input input-bordered w-full"
                          value={formData.original_price}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Pourcentage de réduction (%)</span>
                        </label>
                        <input
                          type="number"
                          name="discount_percentage"
                          min="0"
                          max="100"
                          step="5"
                          className="input input-bordered w-full"
                          value={formData.discount_percentage}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Date de fin de promotion</span>
                        </label>
                        <input
                          type="datetime-local"
                          name="sale_end_date"
                          className="input input-bordered w-full"
                          value={formData.sale_end_date}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  )}
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
      {/* Modal de modification de produit */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Modifier le produit</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-ghost btn-circle"
                >
                  <FaTimes />
                </button>
              </div>
              <form className="space-y-4" onSubmit={handleUpdateProduct}>
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
                      name="category"
                      className="select select-bordered w-full"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
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
                    <select name="sub_category" className="select select-bordered w-full" required
                    value={formData.sub_category}
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
                      className={`input input-bordered w-full ${formData.variations && formData.variations.length > 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                      required
                      value={formData.stock}
                      onChange={handleInputChange}
                      readOnly={formData.variations && formData.variations.length > 0}
                      disabled={formData.variations && formData.variations.length > 0}
                    />
                    {formData.variations && formData.variations.length > 0 && (
                      <span className="text-xs text-gray-500 mt-1">Le stock est automatiquement calculé comme la somme des stocks des variantes.</span>
                    )}
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
                    name="country"
                    className="select select-bordered w-full"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionnez un pays</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
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
                        <Image src={previewImage} alt={formData.title} className="w-full h-full object-cover" width={80} height={80} />
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

                {/* Section Variations */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-blue-600">Variations et variantes (optionnel)</h3>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Nom de la variation (ex: Couleur, Taille)</span>
                    </label>
                    <input
                      type="text"
                      name="variationName"
                      className="input input-bordered w-full"
                      placeholder="Couleur"
                      value={variationName}
                      onChange={(e) => setVariationName(e.target.value)}
                    />
                  </div>

                  {variants.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Variantes :</h4>
                      {variants.map((variant) => (
                        <div key={variant.id} className="border rounded-lg p-4 mb-3 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="form-control">
                              <label className="label">
                                <span className="label-text text-sm">Nom</span>
                              </label>
                              <input
                                type="text"
                                className="input input-bordered input-sm w-full"
                                value={variant.name}
                                onChange={(e) => handleVariantChange(variant.id, 'name', e.target.value)}
                                placeholder="Rouge"
                              />
                            </div>
                            <div className="form-control">
                              <label className="label">
                                <span className="label-text text-sm">Prix (FCFA)</span>
                              </label>
                              <input
                                type="number"
                                className="input input-bordered input-sm w-full"
                                value={variant.price}
                                onChange={(e) => handleVariantChange(variant.id, 'price', Number(e.target.value))}
                                placeholder="0"
                              />
                            </div>
                            <div className="form-control">
                              <label className="label">
                                <span className="label-text text-sm">Stock</span>
                              </label>
                              <input
                                type="number"
                                className="input input-bordered input-sm w-full"
                                value={variant.stock}
                                onChange={(e) => handleVariantChange(variant.id, 'stock', Number(e.target.value))}
                                placeholder="0"
                              />
                            </div>
                            <div className="form-control">
                              <label className="label">
                                <span className="label-text text-sm">Actions</span>
                              </label>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-error"
                                  onClick={() => handleRemoveVariant(variant.id)}
                                  disabled={variants.length === 1}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline btn-primary"
                        onClick={handleAddVariant}
                      >
                        <FaPlus className="mr-1" /> Ajouter une variante
                      </button>
                    </div>
                  )}

                  {variationName && (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary mt-2"
                      onClick={() => {
                        if (variationName.trim()) {
                          setVariants([{ id: Date.now().toString(), name: "", price: 0, stock: 0, img_src: "" }]);
                        }
                      }}
                    >
                      Créer la variation
                    </button>
                  )}
                </div>

                {/* Section Promotion */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-orange-600">Gestion des promotions</h3>
                  
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Activer la promotion</span>
                      <input
                        type="checkbox"
                        name="is_on_sale"
                        className="checkbox checkbox-primary"
                        checked={formData.is_on_sale}
                        onChange={(e) => setFormData({
                          ...formData,
                          is_on_sale: e.target.checked
                        })}
                      />
                    </label>
                  </div>

                  {formData.is_on_sale && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Prix original (FCFA)</span>
                        </label>
                        <input
                          type="number"
                          name="original_price"
                          min="0"
                          step="100"
                          className="input input-bordered w-full"
                          value={formData.original_price}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Pourcentage de réduction (%)</span>
                        </label>
                        <input
                          type="number"
                          name="discount_percentage"
                          min="0"
                          max="100"
                          step="5"
                          className="input input-bordered w-full"
                          value={formData.discount_percentage}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Date de fin de promotion</span>
                        </label>
                        <input
                          type="datetime-local"
                          name="sale_end_date"
                          className="input input-bordered w-full"
                          value={formData.sale_end_date}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Modal de variation de produit */}
      {isVariationModalOpen && (
        <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center p-2 z-50 sm:p-4" onClick={() => setIsVariationModalOpen(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto sm:max-w-2xl sm:p-6 p-2" onClick={e => e.stopPropagation()}>
            <div className="p-0 sm:p-6">
              <div className="flex  justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
                <h3 className="text-sm md:text-lg sm:text-xl font-bold">Ajouter une variation à <br/>{targetProduct?.title}</h3>
                <button onClick={() => setIsVariationModalOpen(false)} className="btn btn-ghost btn-circle">
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleAddVariationToExistingProduct} className="space-y-3 sm:space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nom de la variation</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full input-sm sm:input-md"
                    value={variationName}
                    onChange={(e) => setVariationName(e.target.value)}
                    placeholder="Ex: Taille, Couleur, etc."
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h4 className="font-medium text-base sm:text-lg">Nouvelles variantes</h4>
                  <button type="button" onClick={handleAddVariant} className="btn btn-xs sm:btn-sm btn-ghost">
                    <FaPlus className="mr-1" /> Ajouter une variante
                  </button>
                </div>
                {variants.map((variant) => (
                  <div key={variant.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-end mb-2 sm:mb-4 p-2 sm:p-4 bg-gray-50 rounded-lg w-full">
                    {/* Image */}
                    <div className="col-span-1 sm:col-span-2 mb-2 sm:mb-0">
                      <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden w-16 h-16 mx-auto">
                        {variant.img_src ? (
                          <Image src={variant.img_src} alt={`Prévisualisation ${variant.name}`} className="w-full h-full object-cover" width={64} height={64} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiImage size={24} />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => e.target.files?.[0] && handleVariantChange(variant.id, 'img_src', e.target.files[0])}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">Image</div>
                    </div>
                    {/* Nom */}
                    <div className="col-span-1 sm:col-span-3">
                      <input
                        type="text"
                        className="input input-bordered w-full input-xs sm:input-sm"
                        placeholder="Nom (ex: Rouge)"
                        value={variant.name}
                        onChange={(e) => handleVariantChange(variant.id, 'name', e.target.value)}
                        required
                      />
                    </div>
                    {/* Prix */}
                    <div className="col-span-1 sm:col-span-2">
                      <div className="flex items-center gap-1 sm:gap-2 w-full">
                        <label htmlFor="price" className="text-gray-500 text-xs sm:text-sm">Prix:</label>
                        <input
                          type="number"
                          className="input input-bordered input-xs sm:input-sm w-full"
                          placeholder="Prix"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    {/* Stock */}
                    <div className="col-span-1 sm:col-span-3 flex items-center gap-1 sm:gap-2 w-full">
                      <label htmlFor="stock" className="text-gray-500 text-xs sm:text-sm">Stock:</label>
                      <input
                        type="number"
                        className="input input-bordered input-xs sm:input-sm w-full"
                        placeholder="Stock"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(variant.id, 'stock', e.target.value)}
                        min="0"
                      />
                    </div>
                    {/* Supprimer */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(variant.id)}
                        className="btn btn-ghost btn-xs sm:btn-sm text-error"
                        disabled={variants.length <= 1}
                        title="Supprimer cette variante"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 pt-2 sm:pt-4">
                  <button type="button" onClick={() => setIsVariationModalOpen(false)} className="btn btn-ghost btn-xs sm:btn-sm">
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary btn-xs sm:btn-sm">
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal des variations existantes */}
      {isExistingVariationsModalOpen && targetProduct && (
        <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center p-4 z-50" onClick={() => setIsExistingVariationsModalOpen(false)}>
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Gérer les variantes de {targetProduct.title}</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setIsExistingVariationsModalOpen(false);
                      openVariationModalForProduct(targetProduct);
                    }} 
                    className="btn btn-primary btn-sm"
                  >
                    <FaPlus className="mr-1" /> Ajouter des variantes
                  </button>
                  <button onClick={() => setIsExistingVariationsModalOpen(false)} className="btn btn-ghost btn-circle">
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {targetProduct.variations && targetProduct.variations.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-lg">{targetProduct.variations[0].name}</h4>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => targetProduct.variations && handleEditVariation(targetProduct.variations[0])}
                          className="btn btn-sm btn-outline"
                        >
                          <FaEdit className="mr-1" /> Modifier
                        </button>
                        <button 
                          onClick={() => targetProduct.variations && handleDeleteVariation(targetProduct.variations[0].id)}
                          className="btn btn-sm btn-error"
                        >
                          <FaTrashAlt className="mr-1" /> Supprimer
                        </button>
                      </div>
                    </div>
                    
                    {targetProduct.variations[0].variants && targetProduct.variations[0].variants.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {targetProduct.variations[0].variants.map((variant) => (
                          <div key={variant.id} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center gap-2 mb-2">
                              {variant.img_src && (
                                <Image src={variant.img_src} alt={variant.name} className="w-8 h-8 object-cover rounded" width={32} height={32} />
                              )}
                              <span className="font-medium">{variant.name}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>Prix: {variant.price} FCFA</p>
                              <p>Stock: {variant.stock} unités</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Aucune variante pour cette variation</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Aucune variation pour ce produit</p>
                    <button 
                      onClick={() => {
                        setIsExistingVariationsModalOpen(false);
                        openVariationModalForProduct(targetProduct);
                      }} 
                      className="btn btn-primary"
                    >
                      <FaPlus className="mr-2" /> Ajouter la première variation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition de variation */}
      {isEditVariationModalOpen && editingVariation && (
        <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center p-2 z-50 sm:p-4" onClick={() => setIsEditVariationModalOpen(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto sm:max-w-2xl sm:p-6 p-2" onClick={e => e.stopPropagation()}>
            <div className="p-0 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
                <h3 className="text-lg sm:text-xl font-bold">Modifier la variation : {editingVariation.name}</h3>
                <button onClick={() => setIsEditVariationModalOpen(false)} className="btn btn-ghost btn-circle">
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSaveVariationEdit} className="space-y-3 sm:space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nom de la variation</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full input-sm sm:input-md"
                    value={variationName}
                    onChange={(e) => setVariationName(e.target.value)}
                    placeholder="Ex: Taille, Couleur, etc."
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h4 className="font-medium text-base sm:text-lg">Variantes</h4>
                  <button type="button" onClick={handleAddVariant} className="btn btn-xs sm:btn-sm btn-ghost">
                    <FaPlus className="mr-1" /> Ajouter une variante
                  </button>
                </div>
                {variants.map((variant) => (
                  <div key={variant.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-end mb-2 sm:mb-4 p-2 sm:p-4 bg-gray-50 rounded-lg w-full">
                    {/* Image */}
                    <div className="col-span-1 sm:col-span-2 mb-2 sm:mb-0">
                      <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden w-16 h-16 mx-auto">
                        {variant.img_src ? (
                          <Image src={variant.img_src} alt={`Prévisualisation ${variant.name}`} className="w-full h-full object-cover" width={64} height={64} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiImage size={24} />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => e.target.files?.[0] && handleVariantChange(variant.id, 'img_src', e.target.files[0])}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">Image</div>
                    </div>
                    {/* Nom */}
                    <div className="col-span-1 sm:col-span-3">
                      <input
                        type="text"
                        className="input input-bordered w-full input-xs sm:input-sm"
                        placeholder="Nom (ex: Rouge)"
                        value={variant.name}
                        onChange={(e) => handleVariantChange(variant.id, 'name', e.target.value)}
                        required
                      />
                    </div>
                    {/* Prix */}
                    <div className="col-span-1 sm:col-span-2">
                      <div className="flex items-center gap-1 sm:gap-2 w-full">
                        <label htmlFor="price" className="text-gray-500 text-xs sm:text-sm">Prix:</label>
                        <input
                          type="number"
                          className="input input-bordered input-xs sm:input-sm w-full"
                          placeholder="Prix"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    {/* Stock */}
                    <div className="col-span-1 sm:col-span-3 flex items-center gap-1 sm:gap-2 w-full">
                      <label htmlFor="stock" className="text-gray-500 text-xs sm:text-sm">Stock:</label>
                      <input
                        type="number"
                        className="input input-bordered input-xs sm:input-sm w-full"
                        placeholder="Stock"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(variant.id, 'stock', e.target.value)}
                        min="0"
                      />
                    </div>
                    {/* Supprimer */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(variant.id)}
                        className="btn btn-ghost btn-xs sm:btn-sm text-error"
                        disabled={variants.length <= 1}
                        title="Supprimer cette variante"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 pt-2 sm:pt-4">
                  <button type="button" onClick={() => setIsEditVariationModalOpen(false)} className="btn btn-ghost btn-xs sm:btn-sm">
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary btn-xs sm:btn-sm">
                    Enregistrer les modifications
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