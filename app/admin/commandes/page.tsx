"use client";
import React, { useState, useEffect } from 'react';
import { FaEdit, FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import supabase from '@/app/lib/supabaseClient';
import { productType, orderType, VariantType, VariationOptionType } from '@/app/types/types';
import Image from 'next/image';
import { useAdminPagination } from '@/app/hooks/useAdminPagination';
import AdminPagination from '@/components/ui/AdminPagination';
import { useAuth } from '@/app/contexts/AuthContext';
import { FiMapPin, FiUser, FiDollarSign, FiLayers, FiPackage, FiCalendar } from 'react-icons/fi';

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


  const searchProducts = async () => {
    if (!productSearchTerm) {
        setSearchedProducts([]);
        return;
    };
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
      console.error('Error searching products:', error);
      setSearchedProducts([]);
    } else {
      const transformed = data.map(p => ({
        ...p,
        imgSrc: p.img_src,
        variations: p.variations.map((v: any) => ({
          ...v,
          variants: v.variants.map((variant: any) => ({ ...variant, imgSrc: variant.img_src }))
        }))
      }))
      setSearchedProducts(transformed);
    }
    setLoadingSearch(false);
  };

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
    if (!selectedProduct) {
        alert("Veuillez sélectionner un produit.");
        return;
    }

    if (editingOrder) {
      // Update logic
      const { error } = await supabase
        .from('orders')
        .update({
          quantity: orderData.quantity,
          price: orderData.price,
          country: orderData.country,
          variant_id: selectedVariant?.id || null,
        })
        .eq('id', editingOrder.id);

      if (error) {
        console.error("Error updating order:", error);
        alert("Erreur lors de la mise à jour de la commande.");
      } else {
        alert("Commande mise à jour avec succès !");
        closeModal();
        refreshOrders();
      }
    } else {
      // Create logic
      const finalOrderData = {
        ...orderData,
        product_id: selectedProduct.id,
        variant_id: selectedVariant?.id || null,
        admin_email: session?.user?.email,
        admin_username: session?.user?.user_metadata?.username
      };
      
      const { error } = await supabase.from('orders').insert([finalOrderData]);
      if (error) {
          console.error("Error creating order:", error);
          alert("Erreur lors de la création de la commande.");
      } else {
          alert("Commande créée avec succès !");
          closeModal();
          refreshOrders();
      }
    }
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
        ...(order.products as any),
        imgSrc: (order.products as any).img_src,
        variations: (order.products as any).variations?.map((v: any) => ({
            ...v,
            variants: v.variants?.map((variant: any) => ({ ...variant, imgSrc: variant.img_src }))
        }))
    } : null;

    setSelectedProduct(productForEdit as productType | null);

    let variantForEdit = null;
    if (productForEdit && order.variant_id) {
        for (const variation of productForEdit.variations || []) {
            const foundVariant = variation.variants.find((v:any) => v.id === order.variant_id);
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
                    <th> <span className='flex items-center'><FiPackage className='mr-2'/> Produit</span></th>
                    <th> <span className='flex items-center'><FiLayers className='mr-2'/> Quantité</span></th>
                    <th> <span className='flex items-center'><FiDollarSign className='mr-2'/> Prix</span></th>
                    <th> <span className='flex items-center'><FiMapPin className='mr-2'/> Pays</span></th>
                    <th> <span className='flex items-center'><FiUser className='mr-2'/> Admin</span></th>
                    <th> <span className='flex items-center'><FiCalendar className='mr-2'/> Date</span></th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="hover">
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                              <img src={(order.products as any)?.img_src || '/placeholder.png'} alt={order.products?.title || 'Produit'} />
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
                        <button onClick={() => handleOpenEditModal(order)} className="btn btn-ghost btn-sm btn-square text-yellow-600 hover:bg-yellow-50">
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                                <img src={p.imgSrc} alt={p.title} />
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
                            <img src={selectedProduct.imgSrc} alt={selectedProduct.title} width={64} height={64} className="rounded-md object-cover"/>
                            <div>
                                <h4 className='font-semibold'>{selectedProduct.title}</h4>
                                <p className='text-sm'>{selectedProduct.price} FCFA</p>
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
                                                    {variant.imgSrc && (
                                                        <img
                                                            src={variant.imgSrc}
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
                  <input type="number" name="quantity" value={orderData.quantity} onChange={handleQuantityChange} min="1" className="input input-bordered w-full"/>
                </div>
                <div className='form-control'>
                  <label className="label"><span className="label-text">Prix personnalisé (FCFA)</span></label>
                  <input type="number" name="price" value={orderData.price} onChange={handlePriceChange} placeholder="Prix par défaut" className="input input-bordered w-full"/>
                </div>
                <div className="form-control md:col-span-2">
                  <label className="label"><span className="label-text">Pays</span></label>
                  <input type="text" name="country" value={orderData.country} onChange={handleInputChange} className="input input-bordered w-full" placeholder="Pays de destination"/>
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
