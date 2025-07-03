"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaEdit, FaPlus, FaSearch } from 'react-icons/fa';
import supabase from '@/app/lib/supabaseClient';
import { productType, orderType, VariantType, VariationOptionType } from '@/app/types/types';
import { useAdminPagination } from '@/app/hooks/useAdminPagination';
import AdminPagination from '@/components/ui/AdminPagination';
import { useAuth } from '@/app/contexts/AuthContext';
import { FiMapPin, FiUser, FiDollarSign, FiLayers, FiPackage, FiCalendar } from 'react-icons/fi';
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

// Fonction utilitaire pour convertir un variant snake_case en VariantType
function mapVariant(variant: {
  id: string;
  name: string;
  img_src?: string;
  price?: number;
  stock?: number;
  original_price?: number;
  discount_percentage?: number;
}): VariantType {
  return {
    id: variant.id,
    name: variant.name,
    img_src: variant.img_src ?? '',
    price: variant.price,
    stock: variant.stock,
    original_price: variant.original_price,
    discount_percentage: variant.discount_percentage,
  };
}

// Fonction utilitaire pour convertir une variation snake_case en VariationOptionType
function mapVariation(variation: {
  id: string;
  name: string;
  variants: VariantType[];
}): VariationOptionType {
  return {
    id: variation.id,
    name: variation.name,
    variants: (variation.variants || []).map(mapVariant),
  };
}

// Fonction utilitaire pour convertir un produit snake_case en productType
function mapProduct(product: productType): productType {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    original_price: product.original_price,
    discount_percentage: product.discount_percentage,
    is_on_sale: product.is_on_sale,
    sale_end_date: product.sale_end_date,
    manga: product.manga,
    img_src: product.img_src ?? '',
    image_file: undefined,
    category: product.category,
    sub_category: product.sub_category,
    info_product: product.info_product,
    stock: product.stock,
    variations: (product.variations || []).map(mapVariation),
    country: product.country,
    available_cities: product.available_cities,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
}

export default function Commandes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<orderType | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [searchedProducts, setSearchedProducts] = useState<productType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<productType | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantType | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const { session } = useAuth();

  const [orderData, setOrderData] = useState({
    product_id: '',
    variant_id: '',
    quantity: 1,
    price: 0,
    country: '',
  });
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' }>({ message: '', type: 'success' });

  // Debounce search term
  useEffect(() => {
    if (!editingOrder) {
      const timer = setTimeout(() => {
        if (productSearchTerm.length > 0) {
          searchProducts();
        } else {
          setSearchedProducts([]);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [productSearchTerm, editingOrder]);
  
  const {
    data: orders,
    loading: ordersLoading,
    error: ordersError,
    currentPage,
    totalPages,
    totalCount,
    goToPage,
    nextPage,
    prevPage,
    refresh: refreshOrders,
    hasNextPage,
    hasPrevPage
  } = useAdminPagination<orderType>({
    table: 'orders',
    pageSize: 10,
    select: '*, products(*, variations(*, variants(*)))',
    orderBy: { column: 'created_at', ascending: false }
  });

  // Mapping pour transformer img_src -> imgSrc pour les produits dans les commandes, sans any
  const transformedOrders = useMemo(() => (orders || []).map(order => ({
    ...order,
    products: order.products ? mapProduct(order.products) : undefined
  })), [orders]);

  const searchProducts = useCallback(async () => {
    if (!productSearchTerm || productSearchTerm.length < 3) {
      setSearchedProducts([]);
      return;
    }
    setLoadingSearch(true);
    const { data, error } = await supabase
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
      .or(`title.ilike.%${productSearchTerm}%,description.ilike.%${productSearchTerm}%`)
      .limit(10);

    if (error) {
      setNotification({ message: 'Erreur lors de la recherche de produits.', type: 'error' });
      setSearchedProducts([]);
    } else {
      const transformed = data.map(mapProduct);
      setSearchedProducts(transformed);
    }
    setLoadingSearch(false);
  }, [productSearchTerm]);

  const handleSelectProduct = (product: productType) => {
    setSelectedProduct(product);
    setSelectedVariant(null);
    setOrderData(prev => ({
      ...prev,
      product_id: product.id,
      variant_id: '',
      price: product.price
    }));
    setProductSearchTerm('');
    setSearchedProducts([]);
  };

  const handleSelectVariant = (variation: VariationOptionType, variant: VariantType) => {
    setSelectedVariant(variant);
    setOrderData(prev => ({
      ...prev,
      variant_id: variant.id,
      price: variant.price || selectedProduct?.price || 0
    }));
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderData(prev => ({ ...prev, quantity: parseInt(e.target.value, 10) }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = e.target.value ? parseFloat(e.target.value) : (selectedVariant?.price || selectedProduct?.price || 0);
    setOrderData(prev => ({ ...prev, price: newPrice }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (!selectedProduct) {
      setNotification({ message: 'Veuillez sélectionner un produit.', type: 'error' });
      return;
    }
    if (orderData.quantity < 1) {
      setNotification({ message: 'La quantité doit être supérieure à 0.', type: 'error' });
      return;
    }
    if (orderData.price < 0) {
      setNotification({ message: 'Le prix ne peut pas être négatif.', type: 'error' });
      return;
    }
    if (!orderData.country) {
      setNotification({ message: 'Le pays est obligatoire.', type: 'error' });
      return;
    }

    // Gestion du stock
    const stockDisponible = selectedVariant ? selectedVariant.stock : selectedProduct?.stock;
    const ancienneQuantite = editingOrder ? editingOrder.quantity : 0;
    const nouvelleQuantite = orderData.quantity;
    const differenceQuantite = nouvelleQuantite - ancienneQuantite;

    if (differenceQuantite > 0 && stockDisponible !== undefined && differenceQuantite > stockDisponible) {
      setNotification({ message: `Stock insuffisant. Stock disponible : ${stockDisponible}`, type: 'error' });
      return;
    }

    let error = null;
    let commandeCreee = false;

    if (editingOrder) {
      // Update logic
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          quantity: orderData.quantity,
          price: orderData.price,
          country: orderData.country,
          variant_id: selectedVariant?.id || null,
        })
        .eq('id', editingOrder.id);
      error = updateError;
      commandeCreee = !updateError;
    } else {
      // Create logic
      const finalOrderData = {
        ...orderData,
        product_id: selectedProduct.id,
        variant_id: selectedVariant?.id || null,
        admin_email: session?.user?.email,
        admin_username: session?.user?.user_metadata?.username
      };
      const { error: insertError } = await supabase.from('orders').insert([finalOrderData]);
      error = insertError;
      commandeCreee = !insertError;
    }

    if (error) {
      setNotification({ message: editingOrder ? 'Erreur lors de la mise à jour de la commande.' : 'Erreur lors de la création de la commande.', type: 'error' });
      return;
    }

    // Mise à jour du stock si la commande a été créée ou modifiée
    if (commandeCreee && differenceQuantite !== 0) {
      try {
        const table = selectedVariant ? 'variants' : 'products';
        const id = selectedVariant ? selectedVariant.id : selectedProduct.id;
        const nouveauStock = (stockDisponible ?? 0) - differenceQuantite;
        if (nouveauStock < 0) {
          setNotification({ message: 'Erreur de stock : stock négatif détecté.', type: 'error' });
          return;
        }
        const { error: stockError } = await supabase
          .from(table)
          .update({ stock: nouveauStock })
          .eq('id', id);
        if (stockError) {
          setNotification({ message: 'Commande enregistrée, mais erreur lors de la mise à jour du stock.', type: 'error' });
        } else {
          setNotification({ message: editingOrder ? 'Commande mise à jour et stock ajusté !' : 'Commande créée et stock ajusté !', type: 'success' });
        }
      } catch{
        setNotification({ message: 'Erreur inattendue lors de la mise à jour du stock.', type: 'error' });
      }
    } else {
      setNotification({ message: editingOrder ? 'Commande mise à jour avec succès !' : 'Commande créée avec succès !', type: 'success' });
    }
    closeModal();
    refreshOrders();
  };

  const resetForm = () => {
    setProductSearchTerm('');
    setSearchedProducts([]);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setOrderData({
      product_id: '',
      variant_id: '',
      quantity: 1,
      price: 0,
      country: '',
    });
  };

  const handleOpenEditModal = (order: orderType) => {
    setEditingOrder(order);

    const productForEdit = order.products ? {
      ...(order.products as productType),
      img_src: (order.products as productType).img_src,
      variations: (order.products as productType).variations?.map((v: VariationOptionType) => ({
        ...v,
        variants: v.variants?.map((variant: VariantType) => ({ ...variant, img_src: variant.img_src }))
      }))
    } : null;

    setSelectedProduct(productForEdit as productType | null);

    let variantForEdit = null;
    if (productForEdit && order.variant_id) {
      for (const variation of productForEdit.variations || []) {
        const foundVariant = variation.variants.find((v: VariantType) => v.id === order.variant_id);
        if (foundVariant) {
          variantForEdit = foundVariant;
          break;
        }
      }
    }
    setSelectedVariant(variantForEdit);

    setOrderData({
      product_id: order.product_id,
      variant_id: order.variant_id || '',
      quantity: order.quantity,
      price: order.price,
      country: order.country || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
    resetForm();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-screen">
      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: 'success' })} />
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez les commandes enregistrées manuellement.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <FaPlus className="mr-2" />
            Nouvelle commande
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <div className='flex justify-between items-center mb-4'>
          {/* TODO: Add search and filters if needed */}
          <p className='text-sm text-gray-600'>Tableau des commandes</p>
        </div>
        {ordersLoading ? (
          <div className='flex justify-center items-center h-full'>
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        ) : ordersError ? (
          <p>Erreur de chargement des commandes.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th> <span className='flex items-center'><FiPackage className='mr-2' /> Produit</span></th>
                    <th> <span className='flex items-center'><FiLayers className='mr-2' /> Quantité</span></th>
                    <th> <span className='flex items-center'><FiDollarSign className='mr-2' /> Prix</span></th>
                    <th> <span className='flex items-center'><FiMapPin className='mr-2' /> Pays</span></th>
                    <th> <span className='flex items-center'><FiUser className='mr-2' /> Admin</span></th>
                    <th> <span className='flex items-center'><FiCalendar className='mr-2' /> Date</span></th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transformedOrders.map(order => (
                    <tr key={order.id} className="hover">
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                              <Image src={order.products?.img_src || '/placeholder.png'} width={48} height={48} alt={order.products?.title || 'Produit'} />
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{order.products?.title || 'Produit non trouvé'}</div>
                            <div className="text-sm opacity-50">{order.price} FCFA</div>
                          </div>
                        </div>
                      </td>
                      <td>{order.quantity}</td>
                      <td>{order.price * order.quantity} FCFA</td>
                      <td>{order.country}</td>
                      <td>
                        <div>{order.admin_username}</div>
                        <div className="text-sm opacity-50">{order.admin_email}</div>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => handleOpenEditModal(order)} className="btn btn-ghost btn-sm btn-square text-yellow-600 hover:bg-yellow-50" aria-label="Modifier la commande">
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            <h3 className="font-bold text-lg">{editingOrder ? 'Modifier la commande' : 'Nouvelle Commande'}</h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Product Search */}
              {!editingOrder && (
                <div className='form-control'>
                  <label className="label">
                    <span className="label-text">Rechercher un produit</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="search-product"
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="input input-bordered w-full pr-10"
                      placeholder="Nom du produit..."
                    />
                    <div className="absolute top-0 right-0 mt-3 mr-3">
                      <FaSearch className="text-gray-400" />
                    </div>
                  </div>
                  {loadingSearch && <p className="mt-2 text-sm text-gray-500">Recherche...</p>}
                  {searchedProducts.length > 0 && (
                    <ul className="menu bg-base-100 w-full rounded-box mt-1 shadow-lg z-10">
                      {searchedProducts.map(p => (
                        <li key={p.id} onClick={() => handleSelectProduct(p)}>
                          <a>
                            <div className="avatar">
                              <div className="w-8 rounded">
                                <Image src={p.img_src} width={32} height={32} alt={p.title} />
                              </div>
                            </div>
                            {p.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Product Details */}
              {selectedProduct && (
                <div className="p-4 border rounded-md bg-base-200">
                  <h3 className="font-medium mb-2">Détails du produit</h3>
                  <div>
                    <div className='flex items-center gap-4'>
                      <Image src={selectedProduct.img_src} alt={selectedProduct.title} width={64} height={64} className="rounded-md object-cover" />
                      <div>
                        <h4 className='font-semibold'>{selectedProduct.title}</h4>
                        <p className='text-sm'>{selectedProduct.price} FCFA</p>
                        {selectedVariant ? (
                          <p className='text-xs text-gray-500'>Stock disponible : {selectedVariant.stock}</p>
                        ) : (
                          <p className='text-xs text-gray-500'>Stock disponible : {selectedProduct.stock}</p>
                        )}
                      </div>
                    </div>

                    {selectedProduct.variations && selectedProduct.variations.length > 0 && (
                      <div className='mt-4 space-y-4'>
                        {selectedProduct.variations.map(variation => (
                          <div key={variation.id}>
                            <h5 className='text-sm font-medium'>{variation.name}</h5>
                            <div className='flex flex-wrap gap-2 mt-2'>
                              {variation.variants.map(variant => (
                                <button
                                  type="button"
                                  key={variant.id}
                                  onClick={() => handleSelectVariant(variation, variant)}
                                  className={`btn btn-sm flex items-center gap-2 ${selectedVariant?.id === variant.id ? 'btn-primary' : 'btn-outline'}`}
                                >
                                  {variant.img_src && (
                                    <Image
                                      src={variant.img_src}
                                      width={24}
                                      height={24}
                                      alt={variant.name}
                                      className="w-6 h-6 rounded object-cover"
                                    />
                                  )}
                                  {variant.name} {variant.price && `(${variant.price} FCFA)`}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className='form-control'>
                  <label className="label"><span className="label-text">Quantité</span></label>
                  <input type="number" name="quantity" value={orderData.quantity} onChange={handleQuantityChange} min="1" className="input input-bordered w-full" />
                </div>
                <div className='form-control'>
                  <label className="label"><span className="label-text">Prix personnalisé (FCFA)</span></label>
                  <input type="number" name="price" value={orderData.price} onChange={handlePriceChange} placeholder="Prix par défaut" className="input input-bordered w-full" />
                </div>
                <div className="form-control md:col-span-2">
                  <label className="label"><span className="label-text">Pays</span></label>
                  <input type="text" name="country" value={orderData.country} onChange={handleInputChange} className="input input-bordered w-full" placeholder="Pays de destination" />
                </div>
              </div>

              <div className="modal-action">
                <button type="button" onClick={closeModal} className="btn btn-ghost">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingOrder ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
