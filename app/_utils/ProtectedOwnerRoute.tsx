'use client';

import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import supabase from '@/app/lib/supabaseClient';

export default function ProtectedOwnerRoute({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { session, loading } = useAuth();

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!session) {
            router.replace('/login');
            return;
        }

        const checkUserRole = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (error || data.role !== 'owner') {
                router.replace('/client');
            }
        };

        checkUserRole();
    }, [session, loading, router]);

    if (loading || !session) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <span className='loading loading-spinner loading-lg text-primary'></span>
            </div>
        );
    }

    return <>{children}</>;
} 