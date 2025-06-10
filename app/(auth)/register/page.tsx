'use client';

import { useEffect, useState } from 'react';
import { FaPhoneAlt, FaUser } from 'react-icons/fa';
import { IoMailSharp } from 'react-icons/io5';
import Link from 'next/link';
import TitleCategory from '@/components/ui/TitleCategory';
import { useCountry } from '@/app/contexts/CountryContext';	

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { country, setCountry } = useCountry();

    const validatePhoneNumber = (number: string, country: string): boolean => {
        // Supprimer tous les caractères non numériques
        const cleanNumber = number.replace(/\D/g, '');
        
        switch (country) {
            case 'Cameroun':
                // Numéro camerounais: commence par 6 et contient 9 chiffres
                return /^6\d{8}$/.test(cleanNumber);
            case 'Gabon':
                // Numéro gabonais: commence par 0 et contient 8 chiffres
                return /^0\d{7}$/.test(cleanNumber);
            default:
                return false;
        }
    };

    const formatPhoneNumber = (number: string, country: string): string => {
        const cleanNumber = number.replace(/\D/g, '');
        
        switch (country) {
            case 'Cameroun':
                return cleanNumber.slice(0, 9);
            case 'Gabon':
                return cleanNumber.slice(0, 8);
            default:
                return cleanNumber;
        }
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const formattedNumber = formatPhoneNumber(value, country);
        setPhoneNumer(formattedNumber);
    };

    useEffect(() => {
        const country = localStorage.getItem('country');
        if (country) setCountry(country);
    }, [country, setCountry])

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validation des champs
            if (!username || !email || !phoneNumber || !country) {
                throw new Error('Veuillez remplir tous les champs');
            }

            // Validation du numéro de téléphone
            if (!validatePhoneNumber(phoneNumber, country)) {
                throw new Error('Entrez un numéro de téléphone valide');
            }

            // TODO: Implémenter la logique d'inscription ici
            // const response = await fetch('/api/register', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ username, email, phoneNumber, country })
            // });

            // if (!response.ok) {
            //     throw new Error('Erreur lors de l\'inscription');
            // }

            // Redirection après inscription réussie
            // router.push('/login');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }

    const handleSocialLogin = (provider: 'google' | 'facebook') => {
        // TODO: Implémenter la connexion sociale
        console.log(`Inscription avec ${provider}`);
    }

    return (
        <>
            <div className='flex flex-col gap-6 my-20 p-4 max-w-md mx-auto'>
                <h1 className='text-center text-2xl font-bold'><TitleCategory title='Inscription' /></h1>
                {error && (
                    <div className="alert alert-error bg-error/10 text-error border-error/20 shadow-sm rounded-lg flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}
                <form className='flex flex-col gap-6 bg-base-200 p-6 rounded-lg shadow-md' onSubmit={handleRegister}>
                    <div className='space-y-4'>
                        <label className='input input-bordered flex items-center gap-2 w-full'>
                            <FaUser className='text-primary text-lg' />
                            <input 
                                type="text" 
                                placeholder="Nom d'utilisateur" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                                className='grow'
                            />
                        </label>
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm font-medium'>Pays et numéro de téléphone</label>
                            <div className='flex items-center gap-2'>
                                <select 
                                    name="country" 
                                    id="country" 
                                    value={country} 
                                    onChange={(e) => setCountry(e.target.value)} 
                                    className='select select-bordered w-1/3' 
                                    required
                                >
                                    <option value="">Pays</option>
                                    <option value="Cameroun">+237</option>
                                    <option value="Gabon">+241</option>
                                </select>
                                <div className='input input-bordered flex items-center gap-2 flex-1'>
                                    <FaPhoneAlt className='text-primary text-lg' />
                                    <input 
                                        type="tel" 
                                        placeholder={country === 'Cameroun' ? '6XXXXXXXX' : '0XXXXXXX'} 
                                        value={phoneNumber} 
                                        onChange={handlePhoneNumberChange}
                                        required 
                                        className='grow'
                                        maxLength={country === 'Cameroun' ? 9 : 8}
                                    />
                                </div>
                            </div>
                        </div>
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
                    </div>
                    <button 
                        type='submit' 
                        className='btn btn-primary w-full text-white hover:opacity-90 transition-opacity' 
                        disabled={loading}
                    >
                        {loading ? (
                            <span className='flex items-center gap-2'>
                                <span className="loading loading-spinner loading-sm"></span>
                                Inscription en cours...
                            </span>
                        ) : 'S\'inscrire'}
                    </button>

                    <div className="divider text-sm text-base-content/60">ou continuer avec</div>

                    <div className='flex justify-between w-full gap-4'>
                        {/* Google */}
                        <button 
                            className="btn bg-white text-black border-[#e5e5e5]"
                            onClick={() => handleSocialLogin('google')}
                        >
                            <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                            Google
                        </button>

                        {/* Facebook */}
                        <button 
                            className="btn bg-[#1A77F2] text-white border-[#005fd8]"
                            onClick={() => handleSocialLogin('facebook')}
                        >
                            <svg aria-label="Facebook logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="white" d="M8 12h5V8c0-6 4-7 11-6v5c-4 0-5 0-5 3v2h5l-1 6h-4v12h-6V18H8z"></path></svg>
                            Facebook
                        </button>
                    </div>

                    <p className='text-center text-sm'>
                        Vous avez déjà un compte ? 
                        <Link href='/login' className='text-primary hover:underline ml-1'>
                            Connectez-vous
                        </Link>
                    </p>
                </form>
            </div>
        </>
    )
}