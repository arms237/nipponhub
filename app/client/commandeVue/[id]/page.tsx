'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import supabase from '@/app/lib/supabaseClient';
import Loading from '@/app/loading';
import { orderType, CartItem } from '@/app/types/types';
import Image from 'next/image';

export default function CommandeVue() {
  const { id } = useParams();
  const [order, setOrder] = useState<orderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('client_orders')
          .select('*')
          .eq('id', id)
          .single();
        console.log(error);
        if (error) throw error;
        setOrder(data as orderType);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) return (
    <Loading/>
  );
  if (error) return <div className="p-8 text-center text-red-500">Erreur : {error}</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Commande introuvable.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Votre commande</h1>
      <div className="bg-base-100 p-6 rounded-lg shadow mb-6">
        <div className="mb-2"><b>Nom :</b> {order.username}</div>
        <div className="mb-2"><b>Email :</b> {order.email}</div>
        <div className="mb-2"><b>Téléphone :</b> {order.phone}</div>
        <div className="mb-2"><b>Adresse :</b> {order.address}, {order.city}, {order.country}</div>
        <div className="mb-2"><b>Notes :</b> {order.notes}</div>
        <div className="mb-2"><b>Date :</b> {new Date(order.created_at).toLocaleString()}</div>
      </div>
      <h2 className="text-xl font-semibold mb-2">Articles commandés</h2>
      <div className="space-y-4">
        {order.cart_items && Array.isArray(order.cart_items) && order.cart_items.length > 0 ? (
          <ul>
            {order.cart_items.map((item: CartItem) => (
              <li key={item.id} className="flex items-center gap-4 border-b py-2">
                <Image src={item.img_src || '/app/images/default-product.png'} alt={item.title} className="w-12 h-12 object-cover rounded" width={48} height={48} />
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-500">Quantité : {item.quantity}</div>
                  <div className="text-sm text-gray-500">Prix : {item.price} FCFA</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div>Aucun produit dans cette commande.</div>
        )}
      </div>
      <div className="mt-6 text-lg font-bold">
        <div className="font-semibold">Total : {order.cart_items?.reduce((sum: number, item: CartItem) => sum + (item.price * (item.quantity || 1)), 0).toLocaleString()} FCFA</div>
      </div>
    </div>
  );
}