import { useAuth } from '@/app/contexts/AuthContext';
import React from 'react'

export default function Profile() {
    const { session } = useAuth();
  return (
    <div>
        <h1>Profile</h1>
        <p>{session?.user?.email}</p>
        <p>{session?.user?.phone}</p>
        <p>{session?.user?.role}</p>
        <p>{session?.user?.created_at}</p>
        <p>{session?.user?.updated_at}</p>
        <p>{session?.user?.id}</p>
    </div>
  )
}
