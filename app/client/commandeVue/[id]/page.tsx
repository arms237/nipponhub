'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import supabase from '@/app/lib/supabaseClient';
import Loading from '@/app/loading';

export default function CommandeVue() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_orders')
        .select('*')
        .eq('id', id)
        .single();
      setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  if (loading) return (
    <Loading/>
  );
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
        {order.cart_items && order.cart_items.map((item: any) => (
          <div key={item.id} className="flex items-center gap-4 border-b pb-4">
            <div className="avatar">
              <div className="w-16 h-16 rounded bg-base-200 relative">
                {item.imgSrc && (
                  <img
                    src={item.imgSrc}
                    alt={item.title}
                    width={64}
                    height={64}
                    className="object-cover rounded"
                  />
                )}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{item.title}</h3>
              <div className="text-sm text-gray-500">
                Quantité: {item.quantity}
              </div>
            </div>
            <div className="font-medium">
              {item.price.toLocaleString()} FCFA
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-lg font-bold">
        Total : {order.cart_items?.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0).toLocaleString()} FCFA
      </div>
    </div>
  );
}