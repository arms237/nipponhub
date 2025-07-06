"use client"
import React, { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProtectedAuthRoute({children}:{children:React.ReactNode}) {
    const {session} = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push('/');
        }
    }, [session, router]);

    return <>{children}</>;
}
