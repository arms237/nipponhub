"use client";
import React, { useState, useEffect } from 'react';
import { orderType, productType, userType, VariantType, VariationOptionType } from '@/app/types/types';
import supabase from '@/app/lib/supabaseClient';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/app/contexts/AuthContext';
import Loading from '@/app/loading';
import { useAdminPagination } from '@/app/hooks/useAdminPagination';
import AdminPagination from '@/components/ui/AdminPagination';

// Type étendu pour les commandes avec les jointures
interface OrderWithRelations extends orderType {
  product?: {
    title: string;
  };
  variant?: {
    name: string;
  };
}

// Cache simple pour les produits
const productsCache = new Map<string, productType>();

export default function Commandes() {
  const [products, setProducts] = useState<productType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderWithRelations | null>(null);

  // États pour le formulaire de nouvelle vente
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [overridePrice, setOverridePrice] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<productType[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // États pour l'édition
  const [editQuantity, setEditQuantity] = useState(1);
  const [editProductSearchTerm, setEditProductSearchTerm] = useState('');
  const [editFilteredProducts, setEditFilteredProducts] = useState<productType[]>([]);
  const [editSearchingProducts, setEditSearchingProducts] = useState(false);
  const [editSelectedProductId, setEditSelectedProductId] = useState<string | null>(null);
  const [editSelectedVariantId, setEditSelectedVariantId] = useState<string | null>(null);

  const { session } = useAuth();

  const resetNewSaleForm = () => {
    setSelectedProductId(null);
    setSelectedVariantId(null);
    setQuantity(1);
    setOverridePrice('');
    setProductSearchTerm('');
    setFilteredProducts([]);
  };

  // Pagination pour les commandes
  const {
    data: orders,
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
  } = useAdminPagination<OrderWithRelations>({
    table: 'orders',
    pageSize: 15,
    select: `
      id,
      created_at,
      quantity,
      price,
      product:products(title),
      variant:variants(name)
    `,
    orderBy: { column: 'created_at', ascending: sortOrder === 'asc' }
  });

  // Fonction optimisée pour charger un produit spécifique avec ses variations
  const loadProductWithVariations = async (productId: string): Promise<productType | null> => {
    // Vérifier le cache d'abord
    if (productsCache.has(productId)) {
      console.log('✅ Produit récupéré du cache:', productId);
      return productsCache.get(productId)!;
    }

    try {
      console.log('🔍 Chargement du produit avec variations:', productId);
      const { data: productData, error } = await supabase
        .from('products')
        .select(`
          id, 
          title, 
          stock, 
          price,
          variations(
            id, 
            name, 
            variants(id, name, price, stock)
          )
        `)
        .eq('id', productId)
        .single();

      if (error) {
        console.error('❌ Erreur lors du chargement du produit:', error);
        return null;
      }

      // Mettre en cache
      productsCache.set(productId, productData as productType);
      console.log('✅ Produit chargé et mis en cache:', productData.title);
      return productData as productType;
    } catch (error) {
      console.error('❌ Erreur inattendue lors du chargement du produit:', error);
      return null;
    }
  };

  // Recherche de produits optimisée - données minimales
  const searchProducts = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      return;
    }

    setSearchingProducts(true);
    try {
      console.log('🔍 Recherche de produits:', searchTerm);
      
      // Requête optimisée avec données minimales
      const { data: searchResults, error } = await supabase
        .from('products')
        .select('id, title, stock, price')
        .ilike('title', `%${searchTerm}%`)
        .limit(20); // Limite réduite pour plus de rapidité

      if (error) {
        console.error('❌ Erreur lors de la recherche:', error);
        setFilteredProducts([]);
      } else {
        console.log('✅ Résultats de recherche:', searchResults?.length, 'produits');
        setFilteredProducts(searchResults as productType[]);
      }
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la recherche:', error);
      setFilteredProducts([]);
    } finally {
      setSearchingProducts(false);
    }
  };

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (productSearchTerm) {
        searchProducts(productSearchTerm);
      } else {
        setFilteredProducts([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [productSearchTerm]);

  // Variables pour le produit et la variante sélectionnés
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedVariant = selectedProduct?.variations?.[0]?.variants.find((v: any) => v.id === selectedVariantId);

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0 || !session) {
        alert("Veuillez remplir tous les champs requis.");
        return;
    }
    
    // Charger le produit complet avec ses variations si nécessaire
    let product = products.find(p => p.id === selectedProductId);
    if (!product || !product.variations) {
      const loadedProduct = await loadProductWithVariations(selectedProductId);
      if (!loadedProduct) {
        alert("Erreur lors du chargement du produit.");
        return;
      }
      product = loadedProduct;
    }

    let stockItem: { id: string; stock: number; name: string; price: number; } | undefined;
    let isVariant = false;

    // Déterminer s'il s'agit d'une variante ou d'un produit simple
    if (product.variations && product.variations.length > 0 && product.variations[0].variants.length > 0) {
        if (!selectedVariantId) {
            alert("Veuillez sélectionner une variante.");
            return;
        }
        const variant = product.variations[0].variants.find(v => v.id === selectedVariantId);
        if(variant) stockItem = { ...variant, stock: variant.stock || 0, price: variant.price || product.price };
        isVariant = true;
    } else {
        stockItem = { id: product.id, stock: product.stock, name: product.title, price: product.price };
    }

    if (!stockItem || stockItem.stock < quantity) {
        alert(`Stock insuffisant pour ${stockItem?.name}. Disponible : ${stockItem?.stock}`);
        return;
    }

    setLoading(true);
    try {
        const newStock = stockItem.stock - quantity;
        
        // 1. Décrémenter le stock
        if (isVariant) {
            const { error } = await supabase.from('variants').update({ stock: newStock }).eq('id', stockItem.id);
            if (error) throw new Error("Erreur lors de la mise à jour du stock de la variante.");
        } else {
            const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', stockItem.id);
            if (error) throw new Error("Erreur lors de la mise à jour du stock du produit.");
        }

        // 2. Mettre à jour le stock total du produit parent si c'est une variante
        if (isVariant) {
            const totalVariantStock = product.variations?.[0]?.variants.reduce((acc, v) => acc + (v.id === stockItem?.id ? newStock : (v.stock || 0)), 0);
            await supabase.from('products').update({ stock: totalVariantStock }).eq('id', product.id);
        }

        // 3. Enregistrer la commande
        const salePrice = overridePrice ? parseFloat(overridePrice) : stockItem.price;
        const orderData = {
            product_id: product.id,
            variant_id: isVariant ? stockItem.id : null,
            quantity: quantity,
            price: salePrice, // Enregistrer le prix de vente
            user_id: session.user.id, // ID de l'admin qui fait la vente
            email: "manual_sale@nipponhub.com", // Valeur générique
            username: `Admin: ${session.user.email}`,
            phone: 'N/A',
            address: 'N/A',
            city: 'N/A',
            country: 'N/A',
            notes: `Vente manuelle enregistrée par l'administrateur.`,
            status: 'completed'
        };
        const { error: orderError } = await supabase.from('orders').insert([orderData]);
        if (orderError) throw new Error("Erreur lors de la création de la commande.");

        // 4. Incrémenter le `sales_count` de l'admin
        const { data: userData, error: userError } = await supabase.from('users').select('sales_count').eq('id', session.user.id).single();
        if (userError) throw new Error("Erreur lors de la récupération des données de l'utilisateur.");

        await supabase.from('users').update({ sales_count: (userData.sales_count || 0) + 1 }).eq('id', session.user.id);
        
        alert("Vente enregistrée avec succès !");
        setIsModalOpen(false);
        refreshPagination(); // Rafraîchir la pagination au lieu de setLastUpdated
    } catch (error) {
        alert((error as Error).message);
    } finally {
        setLoading(false);
        setIsModalOpen(false);
        resetNewSaleForm();
        refreshPagination();
        setLastUpdated(Date.now());
    }
  };

  // Fonction pour ouvrir le modal d'édition
  const handleEditOrder = async (order: OrderWithRelations) => {
    setEditingOrder(order);
    setEditQuantity(order.quantity);
    setEditSelectedProductId(order.product_id);
    setEditSelectedVariantId(order.variant_id || null);
    setEditProductSearchTerm(order.product?.title || '');
    
    // Charger le produit avec ses variations si nécessaire
    if (order.product_id) {
      const product = await loadProductWithVariations(order.product_id);
      if (product) {
        // Ajouter le produit au cache local si pas déjà présent
        if (!products.find(p => p.id === product.id)) {
          setProducts(prev => [...prev, product]);
        }
      }
    }
    
    setIsEditModalOpen(true);
  };

  // Fonction pour mettre à jour une commande
  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || !editSelectedProductId || editQuantity <= 0 || !session) {
      alert("Veuillez remplir tous les champs requis.");
      return;
    }

    // Charger le produit complet avec ses variations si nécessaire
    let product = products.find(p => p.id === editSelectedProductId);
    if (!product || !product.variations) {
      const loadedProduct = await loadProductWithVariations(editSelectedProductId);
      if (!loadedProduct) {
        alert("Erreur lors du chargement du produit.");
        return;
      }
      product = loadedProduct;
    }

    let stockItem: { id: string; stock: number; name: string; price: number; } | undefined;
    let isVariant = false;

    // Déterminer s'il s'agit d'une variante ou d'un produit simple
    if (product.variations && product.variations.length > 0 && product.variations[0].variants.length > 0) {
      if (!editSelectedVariantId) {
        alert("Veuillez sélectionner une variante.");
        return;
      }
      const variant = product.variations[0].variants.find((v: any) => v.id === editSelectedVariantId);
      if (variant) stockItem = { ...variant, stock: variant.stock || 0, price: variant.price || product.price };
      isVariant = true;
    } else {
      stockItem = { id: product.id, stock: product.stock, name: product.title, price: product.price };
    }

    if (!stockItem) {
      alert("Erreur lors de la récupération des informations du produit.");
      return;
    }

    // Calculer la différence de quantité
    const quantityDifference = editQuantity - editingOrder.quantity;
    const newStock = stockItem.stock - quantityDifference;

    if (newStock < 0) {
      alert(`Stock insuffisant pour ${stockItem.name}. Disponible : ${stockItem.stock}, Quantité demandée : ${Math.abs(quantityDifference)}`);
      return;
    }

    setLoading(true);
    try {
      // 1. Mettre à jour le stock
      if (isVariant) {
        const { error } = await supabase.from('variants').update({ stock: newStock }).eq('id', stockItem.id);
        if (error) throw new Error("Erreur lors de la mise à jour du stock de la variante.");
      } else {
        const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', stockItem.id);
        if (error) throw new Error("Erreur lors de la mise à jour du stock du produit.");
      }

      // 2. Mettre à jour le stock total du produit parent si c'est une variante
      if (isVariant) {
        const totalVariantStock = product.variations?.[0]?.variants.reduce((acc, v) => acc + (v.id === stockItem?.id ? newStock : (v.stock || 0)), 0);
        await supabase.from('products').update({ stock: totalVariantStock }).eq('id', product.id);
      }

      // 3. Mettre à jour la commande
      const orderUpdateData = {
        product_id: product.id,
        variant_id: isVariant ? stockItem.id : null,
        quantity: editQuantity,
        price: stockItem.price,
        updated_at: new Date().toISOString()
      };

      const { error: orderError } = await supabase
        .from('orders')
        .update(orderUpdateData)
        .eq('id', editingOrder.id);

      if (orderError) throw new Error("Erreur lors de la mise à jour de la commande.");

      alert("Commande mise à jour avec succès !");
      setIsEditModalOpen(false);
      setEditingOrder(null);
      refreshPagination();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Recherche de produits pour l'édition - optimisée
  const searchProductsForEdit = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setEditFilteredProducts([]);
      return;
    }

    setEditSearchingProducts(true);
    try {
      console.log('🔍 Recherche de produits (édition):', searchTerm);
      
      // Requête optimisée avec données minimales
      const { data: searchResults, error } = await supabase
        .from('products')
        .select('id, title, stock, price')
        .ilike('title', `%${searchTerm}%`)
        .limit(20);

      if (error) {
        console.error('❌ Erreur lors de la recherche (édition):', error);
        setEditFilteredProducts([]);
      } else {
        console.log('✅ Résultats de recherche (édition):', searchResults?.length, 'produits');
        setEditFilteredProducts(searchResults as productType[]);
      }
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la recherche (édition):', error);
      setEditFilteredProducts([]);
    } finally {
      setEditSearchingProducts(false);
    }
  };

  // Debounce pour la recherche d'édition
  useEffect(() => {
    const timer = setTimeout(() => {
      if (editProductSearchTerm) {
        searchProductsForEdit(editProductSearchTerm);
      } else {
        setEditFilteredProducts([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [editProductSearchTerm]);

  const editSelectedProduct = products.find(p => p.id === editSelectedProductId);
  const editSelectedVariant = editSelectedProduct?.variations?.[0]?.variants.find((v: any) => v.id === editSelectedVariantId);

  // Calcul du revenu total
  const totalRevenue = orders.reduce((sum, order) => sum + (order.price * order.quantity), 0);

  if (loading && orders.length === 0) {
    return <Loading />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800">Gestion des Commandes</h1>
        <button
          onClick={() => {
            resetNewSaleForm();
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 flex items-center"
        >
          <FaPlus className="mr-2" /> Ajouter une vente
        </button>
      </div>
      
      {/* Affichage des commandes existantes ici */}
      <div className="bg-white p-4 rounded-lg shadow mt-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Historique des Ventes</h2>
            <div className="flex items-center gap-4">
                <span className="font-bold text-lg">Total des ventes : {totalRevenue.toLocaleString()} FCFA</span>
                <select 
                    className="select select-bordered select-sm"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                >
                    <option value="desc">Plus récent</option>
                    <option value="asc">Plus ancien</option>
                </select>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Produit</th>
                <th>Variante</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{new Date(order.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                  <td>{order.product?.title || 'Produit inconnu'}</td>
                  <td>{order.variant?.name || 'Aucune'}</td>
                  <td>{order.quantity}</td>
                  <td>{order.price.toLocaleString()} FCFA</td>
                  <td>{(order.price * order.quantity).toLocaleString()} FCFA</td>
                  <td>
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="btn btn-sm btn-outline"
                      title="Modifier cette commande"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!paginationLoading && (
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={15}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPrevPage={prevPage}
          />
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Nouvelle Vente Manuelle</h2>
              <button onClick={() => { setIsModalOpen(false); resetNewSaleForm(); }} className="text-gray-500 hover:text-gray-800">
                  <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleAddSale}>
              {/* Section Produit */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="product">
                  Produit
                </label>
                <input
                  id="product"
                  type="text"
                  value={productSearchTerm}
                  onChange={(e) => {
                    console.log('🔍 Changement de recherche:', e.target.value);
                    setProductSearchTerm(e.target.value);
                    setSelectedProductId(null); // Reset selection when typing
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Rechercher un produit..."
                />
                <div className="text-xs text-gray-500 mt-1">
                  {searchingProducts ? (
                    <span className="flex items-center">
                      <span className="loading loading-spinner loading-xs mr-1"></span>
                      Recherche en cours...
                    </span>
                  ) : (
                    `Résultats: ${filteredProducts.length} produit(s) trouvé(s)`
                  )}
                </div>
                {searchingProducts && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 p-4 text-center">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="ml-2">Recherche en cours...</span>
                  </div>
                )}
                {!searchingProducts && filteredProducts.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {filteredProducts.map(p => (
                      <li 
                        key={p.id} 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          console.log('✅ Produit sélectionné:', p.title);
                          setSelectedProductId(p.id);
                          setProductSearchTerm(p.title);
                          setFilteredProducts([]); // Hide list after selection
                        }}
                      >
                        {p.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {selectedProduct && selectedProduct.variations?.[0]?.variants && selectedProduct.variations[0].variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="variant">
                    Variante
                  </label>
                  <select 
                    id="variant"
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">-- Choisir une variante --</option>
                    {selectedProduct.variations[0].variants.map(v => (
                      <option key={v.id} value={v.id}>{v.name} (Prix: {v.price?.toLocaleString()} FCFA, Stock: {v.stock})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
                  Quantité
                </label>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  min="1"
                />
              </div>

              {/* Champ pour le prix personnalisé */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="custom-price">
                  Prix de Vente (Optionnel)
                </label>
                <input
                  id="custom-price"
                  type="number"
                  step="0.01"
                  value={overridePrice}
                  onChange={(e) => setOverridePrice(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={
                    selectedProduct
                      ? `Défaut: ${selectedVariant ? selectedVariant.price : selectedProduct.price} €`
                      : 'Prix de vente unitaire'
                  }
                />
                {selectedProduct && (
                  <p className="text-xs text-gray-500 mt-1">
                    Laissez vide pour utiliser le prix par défaut de {selectedVariant ? selectedVariant.price : selectedProduct.price} €.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                  disabled={loading || !selectedProductId}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer la vente'}
                </button>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-800"
                  onClick={() => { setIsModalOpen(false); resetNewSaleForm(); }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition de commande */}
      {isEditModalOpen && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Éditer la Commande</h2>
            <form onSubmit={handleUpdateOrder}>
              {/* Affichage du produit actuel (non modifiable) */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="current-product">
                  Produit Actuel
                </label>
                <input
                  id="current-product"
                  type="text"
                  value={editingOrder.product?.title || 'Produit inconnu'}
                  readOnly
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              {/* Section Produit */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="product">
                  Nouveau Produit
                </label>
                <input
                  id="product"
                  type="text"
                  value={editProductSearchTerm}
                  onChange={(e) => {
                    setEditProductSearchTerm(e.target.value);
                    setEditSelectedProductId(null);
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Rechercher un produit..."
                />
                <div className="text-xs text-gray-500 mt-1">
                  {editSearchingProducts ? (
                    <span className="flex items-center">
                      <span className="loading loading-spinner loading-xs mr-1"></span>
                      Recherche en cours...
                    </span>
                  ) : (
                    `Résultats: ${editFilteredProducts.length} produit(s) trouvé(s)`
                  )}
                </div>
                {editSearchingProducts && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 p-4 text-center">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="ml-2">Recherche en cours...</span>
                  </div>
                )}
                {!editSearchingProducts && editFilteredProducts.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {editFilteredProducts.map(p => (
                      <li 
                        key={p.id} 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setEditSelectedProductId(p.id);
                          setEditProductSearchTerm(p.title);
                          setEditFilteredProducts([]);
                        }}
                      >
                        {p.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {editSelectedProduct && editSelectedProduct.variations?.[0]?.variants && editSelectedProduct.variations[0].variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="variant">
                    Variante
                  </label>
                  <select 
                    id="variant"
                    value={editSelectedVariantId || ''}
                    onChange={(e) => setEditSelectedVariantId(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">-- Choisir une variante --</option>
                    {editSelectedProduct.variations[0].variants.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} (Prix: {v.price?.toLocaleString()} FCFA, Stock: {v.stock})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
                  Nouvelle Quantité
                </label>
                <input
                  id="quantity"
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(Number(e.target.value))}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  min="1"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Quantité actuelle: {editingOrder.quantity} | Différence: {editQuantity - editingOrder.quantity}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                  disabled={loading || !editSelectedProductId}
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour la commande'}
                </button>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-800"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
