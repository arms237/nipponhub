"use client"
import { useAuth } from '@/app/contexts/AuthContext'
import TitleCategory from '@/components/ui/TitleCategory';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { FaEnvelope } from 'react-icons/fa';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!email) {
            setError('Veuillez entrer votre adresse email');
            return;
        }

        try {
            setLoading(true);
            const { success, error } = await resetPassword(email);

            if (error) {
                setError(error);
                return;
            }

            if (success) {
                setMessage('Un email de réinitialisation a été envoyé à votre adresse email');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        } catch{
            setError('Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-6 my-20 p-4 max-w-md mx-auto bg-base-100 rounded-lg shadow">
            <div className="w-full max-w-md space-y-8 p-6 rounded-xl">
                <div><TitleCategory title='Réinitialisation du mot de passe' /></div>

                {message && (
                    <div className="alert alert-success">{message}</div>
                )}

                {error && (
                    <div className="alert alert-error">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="input w-full">
                        <FaEnvelope className='text-primary'/>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full"
                            placeholder="Entrez votre adresse email"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            'Envoyer le lien de réinitialisation'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
} 