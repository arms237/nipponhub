'use client'
import { createContext, useState, useContext, useEffect } from "react";
import { Session } from '@supabase/supabase-js'
import supabase from "../lib/supabaseClient";

// Type strict pour un utilisateur de la table users
export interface User {
    id: string;
    username: string;
    email: string;
    phone: string;
    role: string;
    country: string;
    created_at: string;
    updated_at: string;
    sales_count: number;
}

interface AuthContextType {
    session: Session | null;
    loading: boolean;
    setSession: (session: Session | null) => void;
    registerUser: (username: string, email: string, phone: string, password: string, country: string) => Promise<{
        error: string | null;
        success?: boolean;
        data?: User;
        message?: string;
    }>;
    loginUser: (email: string, password: string) => Promise<{ error: string | null, success?: boolean, data?: User }>;
    confirmEmail: (token: string) => Promise<{ error: string | null, success?: boolean }>;
    logOut: () => void;
    resetPassword: (email: string) => Promise<{ success?: boolean, error?: string | null }>
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const registerUser = async (username: string, email: string, phone: string, password: string, country: string) => {
        try {
            // Vérifier si l'email existe déjà
            const { data: existingUser } = await supabase
                .from('users')
                .select('email')
                .eq('email', email)
                .single();

            if (existingUser) {
                return { error: 'Cet email est déjà utilisé', success: false };
            }

            // Créer l'utilisateur avec Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                        phone,
                        country,
                        role: 'client'
                    },
                    emailRedirectTo: `https://nipponhub.netlify.app/confirm-email`
                }
            });

            if (authError) {
                if (authError.message.includes('you can only request this after')) {
                    return { error: "Merci de patienter quelques secondes avant de réessayer l'inscription.", success: false };
                }
                console.error('Erreur d\'inscription:', authError);
                return { error: authError.message, success: false };
            }

            if (!authData.user) {
                return { error: 'Erreur lors de la création du compte', success: false };
            }
            if (authData.user.email_confirmed_at) {
                // Vérifier si l'utilisateur existe dans la table users de supabase
                const { error: insertError } = await supabase.from('users').insert([{
                    id: authData.user.id,
                    username,
                    email: authData.user.email ?? email,
                    phone,
                    role: 'client',
                    country,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    sales_count: 0
                }]);
                if (insertError) {
                    console.error('Erreur d\'insertion dans la table users:', insertError);
                    return { error: insertError.message, success: false };
                }
            }
            // Construction d'un User minimal pour le retour (les champs manquants sont remplis par défaut)
            const user: User = {
                id: authData.user.id,
                username: username,
                email: authData.user.email ?? email,
                phone: authData.user.user_metadata?.phone ?? phone,
                role: 'client',
                country: country,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                sales_count: 0
            };

            return {
                error: null,
                success: true,
                data: user,
                message: 'Un email de confirmation a été envoyé à votre adresse email'
            };
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            return { error: 'Une erreur est survenue lors de l\'inscription', success: false };
        }

    };


    const loginUser = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error('Erreur de connexion:', error);
                return { error: error.message, success: false };
            }

            if (!data.session) {
                return { error: 'Session non créée', success: false };
            }

            // Vérifier si l'email est confirmé
            if (!data.session.user.email_confirmed_at) {
                return { error: 'Veuillez confirmer votre email avant de vous connecter', success: false };
            }

            // Vérifier si l'utilisateur existe dans la table users
            const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.session.user.id)
                .single();

            // Si l'utilisateur n'existe pas dans la table users, le créer
            if (!existingUser) {
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .insert([
                        {
                            id: data.session.user.id,
                            username: data.session.user.user_metadata.username,
                            email: data.session.user.email,
                            phone: data.session.user.user_metadata.phone,
                            role: 'client',
                            country: data.session.user.user_metadata.country,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            sales_count: 0
                        }
                    ])
                    .select()
                    .single();

                if (userError) {
                    console.error('Erreur création utilisateur:', userError);
                    return { error: 'Erreur lors de la création du profil utilisateur', success: false };
                }

                // Après création, utiliser userData pour construire un User strict
                if (userData) {
                    const user: User = {
                        id: userData.id,
                        username: userData.username,
                        email: userData.email,
                        phone: userData.phone,
                        role: userData.role,
                        country: userData.country,
                        created_at: userData.created_at,
                        updated_at: userData.updated_at,
                        sales_count: userData.sales_count ?? 0
                    };
                    setSession(data.session);
                    return { error: null, success: true, data: user };
                } else {
                    return { error: 'Erreur lors de la création du profil utilisateur', success: false };
                }
            }

            if (existingUser) {
                const user: User = {
                    id: existingUser.id,
                    username: existingUser.username,
                    email: existingUser.email,
                    phone: existingUser.phone,
                    role: existingUser.role,
                    country: existingUser.country,
                    created_at: existingUser.created_at,
                    updated_at: existingUser.updated_at,
                    sales_count: existingUser.sales_count ?? 0
                };
                setSession(data.session);
                return { error: null, success: true, data: user };
            }

            // Cas de sécurité : si rien n'est retourné
            return { error: 'Utilisateur non trouvé', success: false };
        } catch (error) {
            console.error('Erreur inattendue lors de la connexion:', error);
            return { error: 'Une erreur est survenue lors de la connexion', success: false };
        }
    };

    const confirmEmail = async (token: string) => {
        try {
            console.log('Début de la vérification du token...');
            const { data, error } = await supabase.auth.verifyOtp({
                token_hash: token,
                type: 'email'
            });

            if (error) {
                console.error('Erreur de vérification du token:', error);
                return { error: error.message };
            }

            console.log('Token vérifié avec succès:', data);

            if (!data.session) {
                console.error('Pas de session après vérification');
                return { error: 'Session non créée' };
            }
            // Vérifier si l'utilisateur existe déjà dans la table users
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('id', data.session.user.id)
                .single();

            if (!existingUser) {
                // Créer l'utilisateur dans la table users
                await supabase.from('users').insert([{
                    id: data.session.user.id,
                    username: data.session.user.user_metadata.username,
                    email: data.session.user.email,
                    phone: data.session.user.user_metadata.phone,
                    role: 'client',
                    country: data.session.user.user_metadata.country,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    sales_count: 0
                }]);
            }

            return {
                error: null,
                success: true
            };
        } catch (error) {
            console.error('Erreur inattendue lors de la confirmation d\'email:', error);
            return { error: 'Une erreur est survenue lors de la confirmation d\'email' };
        }
    };
    //Ecouter les changements de session
    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    //LogOut
    const logOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Erreur de déconnexion:', error);
        }
    }

    //Réinitialiser le mot de passe
    const resetPassword = async (email: string): Promise<{ success?: boolean, error?: string | null }> => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo: `${window.location.origin}/reset-password`
                }
            );

            if (error) {
                console.error('Erreur de réinitialisation: ', error);
                return { success: false, error: error.message };
            }

            return {
                success: true,
                error: null
            };
        } catch (error) {
            console.error('Erreur: ', error);
            return {
                success: false,
                error: 'Une erreur est survenue lors de la réinitialisation du mot de passe'
            };
        }
    }
    const value = {
        session,
        loading,
        setSession,
        registerUser,
        loginUser,
        confirmEmail,
        logOut,
        resetPassword
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;