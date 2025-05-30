'use client';

import { useState } from 'react';
import { FaPhoneAlt } from 'react-icons/fa';
import { FaCircleUser } from 'react-icons/fa6';
import { IoMailSharp } from 'react-icons/io5';
import Link from 'next/link';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumer]= useState('');
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState('');
    
    return(
        <>
        <div className='flex flex-col gap-4 my-20 p-4'>
            <h1 className='text-2xl font-bold text-center'>Inscription</h1>
            <form className='flex flex-col gap-4 mx-auto md:w-[400px]  w-[300px] '>
                <label className='input input-primary w-full'>
                    <FaCircleUser className='text-primary'/>
                    <input type="text" placeholder="Nom d'utilisateur" value={username} onChange={(e)=>setUsername(e.target.value)} />
                </label>
                <label className='input input-primary w-full'>
                    <FaPhoneAlt className='text-primary'/>
                    <input type="tel" placeholder='Numéro de téléphone' value={phoneNumber} onChange={(e)=>setPhoneNumer(e.target.value)} />
                </label>
                <label className='input input-primary w-full'>
                    <IoMailSharp className='text-primary'/>
                    <input type="email" placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} />
                </label>
            
                <button type='submit' className='btn btn-primary'>S'inscrire</button>
                <p className='text-center'>Vous avez déjà un compte ? <Link href='/login' className='text-primary'>Connectez-vous</Link></p>
            </form>
        </div>
        </>
    )
}