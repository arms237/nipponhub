'use client'
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { FaUser, FaEnvelope, FaPhone, FaUserTag, FaSignOutAlt, FaMapMarkerAlt } from 'react-icons/fa';
import supabase from '@/app/lib/supabaseClient';

export default function Profile() {
    const { session, logOut } = useAuth();
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const fetchUserRole = async () => {
            if (session?.user?.id) {
                const { data, error } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (data) {
                    setUserRole(data.role);
                }
            }
        };

        fetchUserRole();
    }, [session]);

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-primary mb-8">Mon Profil</h1>
                
                {session ? (
                    <div className="bg-base-100 rounded-lg shadow-lg p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                            <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-4xl font-bold">
                                {session?.user?.user_metadata?.username.slice(0,1).toUpperCase()}
                            </div>
                            
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-base-content mb-2">
                                    {session?.user?.user_metadata?.username}
                                </h2>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-base-content">
                                        <FaEnvelope className="text-primary" />
                                        <span>{session?.user?.email}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-base-content">
                                        <FaPhone className="text-primary" />
                                        <span>{session?.user?.user_metadata?.phone || 'Non renseigné'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-base-content">
                                        <FaMapMarkerAlt className="text-primary" />
                                        <span>{session?.user?.user_metadata?.country || 'Non renseigné'}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-base-content">
                                        <FaUserTag className="text-primary" />
                                        <span className="capitalize">{userRole || 'Chargement...'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-base-300 pt-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <button 
                                    onClick={() => {/* TODO: Implémenter l'édition du profil */}}
                                    className="btn btn-primary flex-1"
                                >
                                    <FaUser className="mr-2" />
                                    Modifier le profil
                                </button>
                                
                                <button 
                                    onClick={logOut} 
                                    className="btn btn-error flex-1"
                                >
                                    <FaSignOutAlt className="mr-2" />
                                    Se déconnecter
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center gap-4'>
                        <h1 className='text-2xl font-bold'>Vous n'êtes pas connecté</h1>
                        <Link href='/login' className='btn btn-primary'>Se connecter</Link>
                    </div>
                )}
            </div>
        </div>
    )
}
