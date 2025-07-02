"use client"
import { useAuth } from '@/app/contexts/AuthContext'
import TitleCategory from '@/components/ui/TitleCategory';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react'
import supabase from '@/app/lib/supabaseClient';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { session, logOut } = useAuth();

    useEffect(() => {
        // Si l'utilisateur est connecté, on le déconnecte
        if (session) {
            logOut();
        }
    }, [session, logOut]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (newPassword.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                setError(error.message);
                return;
            }

            setMessage('Mot de passe mis à jour avec succès');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch{
            setError('Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-6 my-20 p-4 max-w-md mx-auto bg-base-100 rounded-lg shadow">
            <div className="w-full max-w-md space-y-8 p-6 rounded-xl">
                <div><TitleCategory title='Nouveau mot de passe' /></div>

                {message && (
                    <div className="alert alert-success">{message}</div>
                )}

                {error && (
                    <div className="alert alert-error">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="input w-full">
                        <FaLock className='text-primary'/>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full"
                            minLength={6}
                            placeholder="Entrez votre nouveau mot de passe"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                        </button>
                    </div>

                    <div className="input w-full">
                        <FaLock className='text-primary'/>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full"
                            minLength={6}
                            placeholder="Confirmez votre nouveau mot de passe"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                        </button>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            'Mettre à jour'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
