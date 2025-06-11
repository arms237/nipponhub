'use client';

import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Loading from '@/app/loading';
import supabase from '@/app/lib/supabaseClient';

export default function ProtectedOwnerRoute({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { session } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            if (!session) {
                router.push('/login');
                return;
            }

            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (userData?.role !== 'owner') {
                router.push('/');
                return;
            }

            setIsOwner(true);
            setIsLoading(false);
        };

        checkAccess();
    }, [session, router]);

    if (isLoading) {
        return <Loading />;
    }

    if (!isOwner) {
        return null;
    }

    return <>{children}</>;
} 