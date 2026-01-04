/*
 * CineMatch
 * Copyright (C) 2025 <Make a Wish team>
 * Authors: see AUTHORS.md
 * SPDX-License-Identifier: GPL-3.0-only
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed WITHOUT ANY WARRANTY.
 * See the GNU General Public License for more details.
 *
 * If not, see <https://www.gnu.org/licenses/>.
 */import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { recomputeAndStoreGenreAffinity } from "../lib/affinity";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const lastComputedForUser = useRef(null);

    const runAffinityOnce = (u) => {
        if (!u?.id) return;
        if (lastComputedForUser.current === u.id) return;
        lastComputedForUser.current = u.id;

        recomputeAndStoreGenreAffinity(u.id).catch((e) => {
            console.error("Affinity recompute failed:", e);
        });
    };

    useEffect(() => {
        let subscription;

        const init = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) console.error("getSession error:", error);

                setSession(data.session);
                setUser(data.session?.user ?? null);

                runAffinityOnce(data.session?.user);
            } catch (e) {
                console.error("Auth init failed:", e);
            } finally {
                setLoading(false);
            }
        };

        init();

        const subRes = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (event === "SIGNED_IN" && session?.user) runAffinityOnce(session.user);
            if (event === "SIGNED_OUT") lastComputedForUser.current = null;
        });

        subscription = subRes.data.subscription;
        return () => subscription?.unsubscribe();
    }, []);

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) return { error };

        setUser(data.user);
        setSession(data.session);

        runAffinityOnce(data.user);
        return { error: null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        lastComputedForUser.current = null;
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