'use client'
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import supabase from '@/app/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { FaUser } from 'react-icons/fa';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
    country: string;
    phone: string;
}

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { session } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const checkAccess = async () => {
            if (!session) {
                router.push('/login');
                return;
            }

            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (userData?.role !== 'owner') {
                router.push('/');
                return;
            }
            console.log(userData);
            fetchUsers();
        };

        checkAccess();
    }, [session]);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
            console.log(data)
        } catch (err) {
            setError('Erreur lors du chargement des utilisateurs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            // Mettre à jour la liste des utilisateurs
            setUsers(users.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
            ));
        } catch (err) {
            setError('Erreur lors de la modification du rôle');
            console.error(err);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
    if (error) return <div className="text-error text-center">{error}</div>;

    return (
        <div className="container mx-auto p-6 w-full">
            <h1 className="text-3xl font-bold mb-8">Gestion des Utilisateurs</h1>
            
            <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th><FaUser/> Nom d'utilisateur</th>
                            <th>Email</th>
                            <th>Pays</th>
                            <th>Téléphone</th>
                            <th>Rôle</th>
                            <th>Date de création</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.country || 'Non renseigné'}</td>
                                <td>{user.phone || 'Non renseigné'}</td>
                                <td>
                                    <select
                                        className="select select-bordered w-full max-w-xs"
                                        value={user.role}
                                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                                    >
                                        <option value="client">Client</option>
                                        <option value="admin">Admin</option>
                                        <option value="owner">Owner</option>
                                    </select>
                                </td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => updateUserRole(user.id, user.role)}
                                    >
                                        Sauvegarder
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 