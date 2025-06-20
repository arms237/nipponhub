'use client';

import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Loading from '@/app/loading';
import supabase from '@/app/lib/supabaseClient';

export default function ProtectedAdminRoute({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { session } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    /*useEffect(() => {
        const checkAccess = async () => {
            // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion
            if (!session) {
                router.push('/login');
                return;
            }

            // On récupère les données de l'utilisateur
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();

            // Si l'utilisateur n'est pas admin ou owner, on le redirige vers la page d'accueil
            if (userData?.role !== 'admin' && userData?.role !== 'owner') {
                router.push('/client');
                return;
            }

            // Si l'utilisateur est admin ou owner, on lui donne accès à la page
            setIsAdmin(true);
            setIsLoading(false);
        };

        checkAccess();
    }, [session, router]);
    
    if (isLoading) {
        return <div className='flex justify-center items-center min-h-screen'><span className='loading loading-spinner loading-lg text-primary'></span></div>;
    }

    if (!isAdmin) {
        return <div className='text-error'>Vous n'avez pas les permissions nécessaires pour accéder à cette page</div>;
    }*/

    return <>{children}</>;
}
