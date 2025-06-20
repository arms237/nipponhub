"use client";
import React, { useState, useEffect } from 'react';
import { orderType, productType, userType, VariantType, VariationOptionType } from '@/app/types/types';
import supabase from '@/app/lib/supabaseClient';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/app/contexts/AuthContext';
import Loading from '@/app/loading';

export default function Commandes() {
  const [orders, setOrders] = useState<orderType[]>([]);
  const [products, setProducts] = useState<productType[]>([]);
  const [users, setUsers] = useState<userType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // États pour le formulaire de nouvelle vente
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<productType[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const { session } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Récupérer les produits avec leurs variantes
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*, variations (*, variants (*))');
      if (productsError) console.error('Error fetching products:', productsError);
      else setProducts(productsData as productType[]);

      // Récupérer les commandes avec les détails du produit et de l'utilisateur
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          quantity,
          price,
          product:products(title),
          variant:variants(name)
        `)
        .order('created_at', { ascending: sortOrder === 'asc' });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      } else {
        console.log('Fetched orders:', ordersData);
        setOrders(ordersData as any[]); // Utiliser any pour gérer les jointures
      }

      setLoading(false);
    };

    fetchData();
  }, [sortOrder, lastUpdated]);
  
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedVariant = selectedProduct?.variations?.[0]?.variants.find(v => v.id === selectedVariantId);
  
  // Filtrer les produits en fonction de la recherche
  useEffect(() => {
    if (productSearchTerm) {
      setFilteredProducts(
        products.filter(p =>
          p.title.toLowerCase().includes(productSearchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredProducts([]);
    }
  }, [productSearchTerm, products]);

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0 || !session) {
        alert("Veuillez remplir tous les champs requis.");
        return;
    }
    
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

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
        const orderData = {
            product_id: product.id,
            variant_id: isVariant ? stockItem.id : null,
            quantity: quantity,
            price: stockItem.price, // Enregistrer le prix de vente
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
        setLastUpdated(Date.now()); // Déclenche le re-fetch
    } catch (error) {
        alert((error as Error).message);
    } finally {
        setLoading(false);
    }
  };

  const totalRevenue = orders.reduce((acc, order) => acc + (order.price * order.quantity), 0);

  if (loading && orders.length === 0) {
    return <Loading />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800">Gestion des Commandes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
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
                <th>Quantité</th>
                <th>Prix Unitaire</th>
                <th>Total Vente</th>
                <th>Admin</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order: any) => (
                  <tr key={order.id}>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      {order.product?.title || <span className="text-red-500">Produit introuvable</span>}
                      {order.variant && <span className="text-sm text-gray-500"> ({order.variant.name})</span>}
                    </td>
                    <td>{order.quantity}</td>
                    <td>{(order.price || 0).toLocaleString()} FCFA</td>
                    <td>{((order.price || 0) * order.quantity).toLocaleString()} FCFA</td>
                    <td>Admin</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4">Aucune commande enregistrée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Enregistrer une nouvelle vente</h2>
                <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost btn-circle">
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleAddSale} className="space-y-4">
                {/* Section Produit */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">1. Sélection du Produit</h3>
                    <div className="form-control relative">
                        <label className="label"><span className="label-text">Rechercher un produit</span></label>
                        <input 
                            type="text"
                            className="input input-bordered w-full"
                            placeholder="Taper le nom du produit..."
                            value={productSearchTerm}
                            onChange={(e) => {
                                setProductSearchTerm(e.target.value);
                                setSelectedProductId(null); // Reset selection when typing
                            }}
                        />
                        {filteredProducts.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                {filteredProducts.map(p => (
                                    <li 
                                        key={p.id} 
                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
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
                        <div className="form-control mt-4">
                            <label className="label"><span className="label-text">Variante</span></label>
                            <select 
                                className="select select-bordered"
                                onChange={(e) => setSelectedVariantId(e.target.value)}
                                required
                            >
                                <option value="">-- Choisir une variante --</option>
                                {selectedProduct.variations[0].variants.map(v => (
                                    <option key={v.id} value={v.id}>{v.name} (Prix: {v.price?.toLocaleString()} FCFA, Stock: {v.stock})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-control mt-4">
                        <label className="label"><span className="label-text">Quantité vendue</span></label>
                        <input 
                            type="number"
                            className="input input-bordered"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            min="1"
                            required
                        />
                    </div>
                </div>

                <div className="modal-action">
                  <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary" disabled={loading || !selectedProductId}>
                    {loading ? 'Enregistrement...' : 'Enregistrer la vente'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
