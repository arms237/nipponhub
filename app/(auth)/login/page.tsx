'use client';

import { useState } from 'react';
import { IoMailSharp } from 'react-icons/io5';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import TitleCategory from '@/components/ui/TitleCategory';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const {loginUser} = useAuth();
    const router = useRouter();


    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await loginUser(email,password);
        if(result.success){
            router.push('/client'); 
        }else{
            setError(result.error || 'Une erreur est survenue lors de la connexion');
        }
        setLoading(false);
    }

   

    return (
        <>
            <div className='flex flex-col gap-6 my-20 p-4 max-w-md mx-auto bg-base-100 rounded-lg shadow'>
                <h1 className='text-center text-2xl font-bold'><TitleCategory title='Connexion' /></h1>
                {error && (
                    <div className="alert alert-error bg-error/10 text-error border-error/20 shadow-sm rounded-lg flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}
                <form className='flex flex-col gap-6 p-6' onSubmit={handleLogin}>
                    <div className='space-y-4'>
                        <label className='input input-bordered flex items-center gap-2 w-full'>
                            <IoMailSharp className='text-primary text-lg' />
                            <input
                                type="email"
                                placeholder='Email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className='grow'
                            />
                        </label>
                        <label className='input input-bordered flex items-center gap-2 w-full'>
                            <FaLock className='text-primary text-lg' />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder='Mot de passe'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className='grow'
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className='btn btn-ghost btn-sm'
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </label>
                    </div>
                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                            Mot de passe oublié ?
                        </Link>
                    </div>
                    <button
                        type='submit'
                        className='btn btn-primary w-full text-white hover:opacity-90 transition-opacity'
                        disabled={loading}
                    >
                        {loading ? (
                            <span className='flex items-center gap-2'>
                                <span className="loading loading-spinner loading-sm"></span>
                                Connexion en cours...
                            </span>
                        ) : 'Se connecter'}
                    </button>
                    <p className='text-center text-sm'>
                        Vous n'avez pas de compte ?
                        <Link href='/register' className='text-primary hover:underline ml-1'>
                            Inscrivez-vous
                        </Link>
                    </p>
                </form>
            </div>
        </>
    )
}