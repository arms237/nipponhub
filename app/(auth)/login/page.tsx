'use client';

import { useState } from 'react';
import { IoMailSharp } from 'react-icons/io5';
import { FaGoogle, FaFacebook, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
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

    const {loginUser, session} = useAuth();
    const router = useRouter();


    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await loginUser(email,password);
        if(result.success){
            router.push('/client/profile');
        }else{
            setError(result.error || 'Une erreur est survenue lors de la connexion');
        }
        setLoading(false);
    }

    const handleSocialLogin = (provider: 'google' | 'facebook') => {
        console.log(`Tentative de connexion avec ${provider}`);
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

                    <div className="divider text-sm text-base-content/60">ou continuer avec</div>

                    <div className='flex justify-between w-full gap-4'>
                        {/* Google */}
                        <button 
                            type="button"
                            className="btn bg-white text-black border-[#e5e5e5]"
                            onClick={() => handleSocialLogin('google')}
                        >
                            <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                            Google
                        </button>

                        {/* Facebook */}
                        <button 
                            type="button"
                            className="btn bg-[#1A77F2] text-white border-[#005fd8]"
                            onClick={() => handleSocialLogin('facebook')}
                        >
                            <svg aria-label="Facebook logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="white" d="M8 12h5V8c0-6 4-7 11-6v5c-4 0-5 0-5 3v2h5l-1 6h-4v12h-6V18H8z"></path></svg>
                            Facebook
                        </button>
                    </div>

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