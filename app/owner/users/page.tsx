'use client'
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import supabase from '@/app/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { FaSearch, FaUser, FaGlobe, FaPhone, FaUserTag, FaCalendar, FaSave } from 'react-icons/fa';
import { useAdminPagination } from '@/app/hooks/useAdminPagination';
import AdminPagination from '@/components/ui/AdminPagination';

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
    const [loading, setLoading] = useState(true);
    const [roleIChanging,setRoleIChanging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { session } = useAuth();
    const router = useRouter();
    const [searchUser, setSearchUser] = useState<string>('');
    const [country, setCountry] = useState<string>('');

    // Pagination pour les utilisateurs
    const {
        data: users,
        loading: paginationLoading,
        error: paginationError,
        currentPage,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        goToPage,
        nextPage,
        prevPage,
        refresh: refreshPagination
    } = useAdminPagination<User>({
        table: 'users',
        pageSize: 20,
        select: '*',
        orderBy: { column: 'created_at', ascending: false },
        filters: {
            ...(country && { country: `%${country}%` })
        },
        searchColumn: 'username',
        searchTerm: searchUser
    });
    console.log(paginationError)
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
            setLoading(false);
        };

        checkAccess();
    }, [session, router]);

    const updateUserRole = async (userId: string, newRole: string) => {
        setRoleIChanging(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            refreshPagination();
        } catch (err) {
            setError('Erreur lors de la modification du rôle');
            console.error(err);
        } finally {
            setRoleIChanging(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen w-full"><span className='loading loading-spinner loading-lg text-primary'></span></div>;
    if (error) return <div className="text-error text-center">{error}</div>;

    return (
        <div className="w-full p-6 bg-gray-50 min-h-screen">
            {/* En-tête */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 p-6 bg-white rounded-xl shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Gestion des Utilisateurs
                    </h1>
                    <p className="text-gray-500">
                        Gérez les utilisateurs et leurs rôles
                    </p>
                </div>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:w-1/3">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            className="input input-bordered w-full pl-10"
                            value={searchUser}
                            onChange={(e) => setSearchUser(e.target.value)}
                        />
                    </div>

                    <select
                        className="select select-bordered w-full md:w-1/4"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    >
                        <option value="">Tous les pays</option>
                        <option value="Cameroun">Cameroun</option>
                        <option value="Gabon">Gabon</option>
                    </select>
                </div>
            </div>

            {/* Tableau des utilisateurs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-gray-50">
                            <tr className="border-b border-gray-200">
                                <th className="p-4 text-left text-gray-500 font-medium">
                                    <div className="flex items-center">
                                        <FaUser className="mr-2" /> Utilisateur
                                    </div>
                                </th>
                                <th className="p-4 text-left text-gray-500 font-medium">
                                    Email
                                </th>
                                <th className="p-4 text-left text-gray-500 font-medium">
                                    <div className="flex items-center">
                                        <FaGlobe className="mr-2" /> Pays
                                    </div>
                                </th>
                                <th className="p-4 text-left text-gray-500 font-medium">
                                    <div className="flex items-center">
                                        <FaPhone className="mr-2" /> Téléphone
                                    </div>
                                </th>
                                <th className="p-4 text-left text-gray-500 font-medium">
                                    <div className="flex items-center">
                                        <FaUserTag className="mr-2" /> Rôle
                                    </div>
                                </th>
                                <th className="p-4 text-left text-gray-500 font-medium">
                                    <div className="flex items-center">
                                        <FaCalendar className="mr-2" /> Date de création
                                    </div>
                                </th>
                                <th className="p-4 text-right text-gray-500 font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                    <td className="p-4">
                                        <div className="flex flex-col ">
                                            <div className="font-medium text-gray-800">{user.username}</div>
                                            <div className="text-sm text-gray-500">ID: {user.id}</div>

                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-700">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${user.country === 'Cameroun' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {user.country || 'Non renseigné'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-700">{user.phone || 'Non renseigné'}</td>
                                    <td className="p-4">
                                        <select
                                            className="select select-bordered w-full min-w-[100px] max-w-xs text-sm"
                                            value={user.role}
                                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                                        >
                                            <option value="client">Client</option>
                                            <option value="admin">Admin</option>
                                            <option value="owner">Owner</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-gray-700 text-center">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end">
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => updateUserRole(user.id, user.role)}
                                            >
                                                {roleIChanging ? <span className="loading loading-spinner loading-sm"> Chargement...</span> : <FaSave className="mr-1" />}
                                                <span className="hidden md:inline">Sauvegarder</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <FaUser className="text-4xl text-gray-300 mb-4" />
                                            <p className="text-lg font-medium text-gray-500 mb-2">
                                                {users.length === 0
                                                    ? "Aucun utilisateur trouvé"
                                                    : "Aucun utilisateur ne correspond aux filtres"}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {users.length === 0
                                                    ? "Aucun utilisateur n'est enregistré"
                                                    : "Essayez de modifier vos filtres de recherche"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!paginationLoading && (
                    <AdminPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        pageSize={20}
                        hasNextPage={hasNextPage}
                        hasPrevPage={hasPrevPage}
                        onPageChange={goToPage}
                        onNextPage={nextPage}
                        onPrevPage={prevPage}
                    />
                )}
            </div>
        </div>
    );
} 