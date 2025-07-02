'use client'
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import { FaEnvelope } from 'react-icons/fa';

export default function ConfirmEmail() {
   const {session} = useAuth();

    return (
        <div className=" h-screen flex items-center justify-center bg-gray-50">
           {!session ? <div className='flex flex-col items-center justify-center gap-4'>
            <span className='text-4xl bg-primary text-white rounded-full p-2'><FaEnvelope/></span>
                <h1 className='text-2xl font-bold'>Confirmation d&apos;email</h1>
                <p className='text-sm text-gray-500 text-center'>Un email de confirmation a été envoyé à votre adresse email</p>
                <a href="https://mail.google.com/" className='btn btn-primary'>Voir votre email</a>
                <p>Vous n&apos;avez pas reçu d&apos;email ?</p>
            </div>
            :
            <div className='flex flex-col items-center justify-center gap-4'>
            <span className='text-4xl bg-primary text-white rounded-full p-2'><FaEnvelope/></span>
                <h1 className='text-2xl font-bold'>Confirmation d&apos;email</h1>
                <p className='text-sm text-gray-500'>Inscription reussie veuillez vous connecter</p>
                <p className='text-sm text-gray-500'>Cliquez ici pour vous connecter</p><Link href="/login" className='btn btn-primary'>Se connecter</Link>
            </div>
            }
        </div>
    );
}
