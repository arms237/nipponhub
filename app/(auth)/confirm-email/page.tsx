'use client'
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ConfirmEmail() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const { confirmEmail } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const confirmUserEmail = async () => {
            try {
                const token = searchParams.get('token');
                console.log('Token reçu:', token);

                if (!token) {
                    setStatus('error');
                    setMessage('Token de confirmation manquant');
                    return;
                }

                console.log('Début de la confirmation...');
                const result = await confirmEmail(token);
                console.log('Résultat de la confirmation:', result);

                if (result.error) {
                    console.error('Erreur de confirmation:', result.error);
                    setStatus('error');
                    setMessage(result.error);
                } else if (result.success) {
                    console.log('Confirmation réussie');
                    setStatus('success');
                    setMessage('Votre email a été confirmé avec succès !');
                    // Rediriger vers la page de connexion après 3 secondes
                    setTimeout(() => {
                        router.push('/auth/login');
                    }, 3000);
                } else {
                    console.error('Résultat inattendu:', result);
                    setStatus('error');
                    setMessage('Une erreur inattendue est survenue');
                }
            } catch (error) {
                console.error('Erreur lors de la confirmation:', error);
                setStatus('error');
                setMessage('Une erreur est survenue lors de la confirmation');
            }
        };

        confirmUserEmail();
    }, [confirmEmail, searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
                {status === 'loading' && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Confirmation de votre email en cours...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Confirmé !</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <p className="text-sm text-gray-500">Vous allez être redirigé vers la page de connexion...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <div className="text-red-500 text-5xl mb-4">✕</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur de Confirmation</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <a 
                            href="/auth/login" 
                            className="text-blue-500 hover:text-blue-700 underline"
                        >
                            Retour à la page de connexion
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
