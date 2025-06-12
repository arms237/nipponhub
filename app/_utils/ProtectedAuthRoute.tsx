"use client"
import React from 'react'
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProtectedAuthRoute({children}:{children:React.ReactNode}) {
    const {session} = useAuth();
    const router = useRouter();

    if(session){
        router.push('/client');
        return null;
    }
    return <>{children}</>;
}
