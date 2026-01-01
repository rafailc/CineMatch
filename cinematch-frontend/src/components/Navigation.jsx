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
 */import { Film, Search, Brain, Sparkles, MessageSquare, LogOut } from "lucide-react";
import NavLink from "../components/NavLink.jsx";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase.js";
import PreferencesModal from "../components/PreferencesModal";


export default function Navigation() {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [prefOpen, setPrefOpen] = useState(false);

    async function handleLogout() {
        await signOut();
        navigate("/login");
    }

    useEffect(() => {
        async function loadUser() {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (error) {
                console.error("Error fetching user:", error);
            }

            setUser(user);
        }

        loadUser();
    }, []);

    const navItems = [
        { path: "/", Icon: Film, label: "Home" },
        { path: "/search", Icon: Search, label: "Search" },
        { path: "/quiz", Icon: Brain, label: "Quiz" },
        { path: "/actor-match", Icon: Sparkles, label: "Actor Match" },
        { path: "/suggest", Icon: Heart, label: "Suggestions" },
        { path: "/CineGram", Icon: MessageSquare, label: "CineGram" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="w-full px-4">
                <div className="relative flex items-center h-16 justify-between">

                    {/* LEFT — Logo */}
                    <div className="flex items-center gap-2">
                        <NavLink to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <Film className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        CineMatch
                    </span>
                        </NavLink>
                    </div>

                    {/* CENTER — Nav links */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
                        {navItems.map(({ path, Icon, label }) => (
                            <NavLink
                                key={path}
                                to={path}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden md:inline">{label}</span>
                            </NavLink>
                        ))}
                    </div>

                    {/* DEJIA / LOGOUT BUTTON  */}
                    <div className="flex items-center ml-auto relative">

                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="
                w-10 h-10 rounded-full
                bg-white/10 backdrop-blur-md
                text-gray-200
                border border-white/20
                hover:bg-white/20
                            transition flex items-center justify-center
        "
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.8"
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0"
                                />
                            </svg>
                        </button>

                        {/* DROPDOWN MENU */}
                        {menuOpen && (
                            <div
                                className="
                        absolute right-0 mt-[400px] z-50
                        w-64 rounded-xl overflow-hidden
                        bg-background/90 backdrop-blur-lg
                        border border-white/10
                        shadow-[0_8px_24px_rgba(0,0,0,0.5)]
                        text-gray-100

                        /* Animation */
                        opacity-0 translate-y-2 scale-95
                        animate-dropdown
    "
                            >
                                {/* Header */}
                                <div className="
                px-4 py-4 border-b border-white/10
                bg-zinc-900
                text-white relative
            ">

                                    <p className="text-xs uppercase tracking-wider text-white/70">
                                        Signed in as
                                    </p>

                                    <div className="flex items-center mt-2">
                                        <div className="bg-white/20 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                                            <svg fill="currentColor" viewBox="0 0 20 20" className="h-4 w-4">
                                                <path
                                                    clipRule="evenodd"
                                                    fillRule="evenodd"
                                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                ></path>
                                            </svg>
                                        </div>

                                        <p className="text-sm font-medium truncate">{user?.email ?? ""}</p>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-2">

                                    {/* Profile */}
                                    <button
                                        onClick={() => navigate("/profile")}
                                        className="
                        group w-full flex items-center px-4 py-3
                        hover:bg-white/10 transition
                        text-gray-100
                    "
                                    >
                                        <div className="
                        w-8 h-8 rounded-lg
                        bg-white/10 flex items-center justify-center
                        mr-3 group-hover:bg-white/20 transition
                    ">
                                            <svg fill="currentColor" viewBox="0 0 20 20" className="h-5 w-5 text-gray-200">
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                />
                                            </svg>
                                        </div>

                                        <span className="font-medium">Profile</span>
                                    </button>

                                    {/* Favorites */}
                                    <button
                                        onClick={() => navigate("/favorites")}
                                        className="
        group w-full flex items-center px-4 py-3
        hover:bg-white/5 transition text-gray-100
    "
                                    >
                                        <div className="
        w-8 h-8 rounded-lg
        bg-white/20 flex items-center justify-center mr-3
        group-hover:bg-white/30 transition
    ">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="h-5 w-5 text-red-400"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M11.645 20.91l-.007-.003-.024-.014a25.18 25.18 0 01-.383-.218 32.13 32.13 0 01-5.2-3.846C3.668 14.862 2 12.338 2 9.5 2 6.462 4.42 4 7.5 4c1.74 0 3.41.81 4.5 2.086A6.149 6.149 0 0116.5 4C19.58 4 22 6.462 22 9.5c0 2.838-1.668 5.362-4.031 7.329a32.134 32.134 0 01-5.583 4.063l-.028.016-.006.003a.75.75 0 01-.707 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>

                                        <span className="font-medium">Favorites</span>
                                    </button>

                                    {/* Preferences */}
                                    <button
                                        onClick={() => {
                                            setPrefOpen(true);
                                            setMenuOpen(false);
                                        }}
                                        className="
        group w-full flex items-center px-4 py-3
        hover:bg-white/5 transition text-gray-100
    "
                                    >
                                        <div className="
        w-8 h-8 rounded-lg
        bg-white/20 flex items-center justify-center mr-3
        group-hover:bg-white/30 transition
    ">
                                            <svg
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                className="h-5 w-5 text-white"
                                            >
                                                <path
                                                    clipRule="evenodd"
                                                    fillRule="evenodd"
                                                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.062 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                                ></path>
                                            </svg>
                                        </div>

                                        <span className="font-medium">Preferences</span>
                                    </button>

                                    {/* Logout */}
                                    <button
                                        onClick={handleLogout}
                                        className="
                        group w-full flex items-center px-4 py-3
                        hover:bg-red-500/20 transition
                        text-red-400
                    "
                                    >
                                        <div className="
                        w-8 h-8 rounded-lg
                        bg-red-500/10 flex items-center justify-center
                        mr-3 group-hover:bg-red-500/20 transition
                    ">
                                            <svg fill="currentColor" viewBox="0 0 20 20" className="h-5 w-5 text-red-400">
                                                <path
                                                    clipRule="evenodd"
                                                    fillRule="evenodd"
                                                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                                                />
                                            </svg>
                                        </div>

                                        <span className="font-medium">Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <PreferencesModal
                open={prefOpen}
                onClose={() => setPrefOpen(false)}
                user={user}
            />
        </nav>
    );
}