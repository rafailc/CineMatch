import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on refresh
    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            setUser(data.session?.user ?? null);
            setLoading(false);
        };

        init();

        // Listen for login/logout events
        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // LOGIN
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) return { error };

        // Set local state immediately
        setUser(data.user);
        setSession(data.session);

        return { error: null };
    };

    // LOGOUT
    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                signIn,
                signOut
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};