import { createContext, useState } from "react";
import {Session} from '@supabase/supabase-js'
import supabase from "../lib/supabaseClient";

interface AuthContextType {
    session: Session | null;
    setSession: (session: Session | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session,setSession] = useState<Session | null>(null);

    const loginUser = async (username:string,email:string,phone:string) => {
       
       
       
    };
    return (
        <AuthContext.Provider value={{session,setSession,}}>{children}</AuthContext.Provider>
    );
};

export default AuthContext;