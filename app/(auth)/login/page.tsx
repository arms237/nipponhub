'use client';

import { useState } from 'react';
import { IoMailSharp } from 'react-icons/io5';
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState('');
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState('');
    
    return(
        <>
        <div className='flex flex-col gap-4 p-4 my-32'>
            <h1 className='text-2xl font-bold text-center'>Connexion</h1>
            <form className='flex flex-col gap-4 mx-auto md:w-[400px] w-[300px] '>
                <label className='input input-primary w-full'>
                    <IoMailSharp/>
                    <input type="email" placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} />
                </label>
            
                <button type='submit' className='btn btn-primary'>Se connecter</button>
                <p className='text-center'>Vous n'avez pas de compte ? <Link href='/register' className='text-primary'>Inscrivez-vous</Link></p>
            </form>
        </div>
        </>
    )
}