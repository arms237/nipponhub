'use client'
import { createContext, useState, useContext, useEffect } from "react";
import { Session } from '@supabase/supabase-js'
import supabase from "../lib/supabaseClient";
import { userType } from "../types/types";

interface AuthContextType {
    session: Session | null;
    setSession: (session: Session | null) => void;
    registerUser: (username: string, email: string, phone: string, password: string, country: string) => Promise<{
        error: string | null;
        success?: boolean;
        data?: any;
        message?: string;
    }>;
    loginUser: (email: string, password: string) => Promise<{ error: string | null, success?: boolean, data?: any }>;
    confirmEmail: (token: string) => Promise<{ error: string | null, success?: boolean }>;
    logOut: () => void;
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

    const registerUser = async (username: string, email: string, phone: string, password: string, country: string) => {
        try {
            // Vérifier si l'email existe déjà
            const { data: existingUser } = await supabase
                .from('users')
                .select('email')
                .eq('email', email)
                .single();

            if (existingUser) {
                return { error: 'Cet email est déjà utilisé',success: false };
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
                    emailRedirectTo: `${window.location.origin}/confirm-email`
                }
            });

            if (authError) {
                console.error('Erreur d\'inscription:', authError);
                return { error: authError.message,success: false };
            }

            if (!authData.user) {
                return { error: 'Erreur lors de la création du compte',success: false };
            }
           
            // Ne pas créer l'utilisateur dans la table users tant que l'email n'est pas confirmé
            // L'utilisateur sera créé lors de la première connexion après confirmation
            console.log(authData);
            return { 
                error: null, 
                success: true, 
                data: authData.user,
                message: 'Un email de confirmation a été envoyé à votre adresse email'
            };
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            return { error: 'Une erreur est survenue lors de l\'inscription',success: false };
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
                return { error: error.message,success: false };
            }

            if (!data.session) {
                return { error: 'Session non créée',success: false };
            }

            // Vérifier si l'email est confirmé
            if (!data.session.user.email_confirmed_at) {
                return { error: 'Veuillez confirmer votre email avant de vous connecter' };
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
                            country: data.session.user.user_metadata.country
                        }
                    ])
                    .select()
                    .single();

                if (userError) {
                    console.error('Erreur création utilisateur:', userError);
                    return { error: 'Erreur lors de la création du profil utilisateur' };
                }
            }

            setSession(data.session);
            return { 
                error: null, 
                success: true, 
                data: data.session
            };
        } catch (error) {
            console.error('Erreur inattendue lors de la connexion:', error);
            return { error: 'Une erreur est survenue lors de la connexion',success: false };
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

            setSession(data.session);
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
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
    console.log(session);
    return (
        <AuthContext.Provider value={{ session, setSession, registerUser, loginUser, confirmEmail, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;