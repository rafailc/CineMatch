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
 */import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, User, Edit, Camera } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import MovieCard from "@/components/MovieCard";
import SeriesCard from "@/components/SeriesCard";
import EditProfileModal from "@/components/EditProfileModal";
import EditAvatarModal from "@/components/EditAvatarModal.jsx";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function ProfilePage() {
    const [userData, setUserData] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [editAvatarOpen, setEditAvatarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        loadProfile();
    }, [location.search]); //   Refreshes when ?updated= changes

    async function loadProfile() {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            navigate("/login");
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();


        if (profile) {
            setUserData(profile);
        }

        const { data: favs } = await supabase
            .from("user_favorites")
            .select("*")
            .eq("user_id", user.id);

        if (favs?.length) {
            const enriched = await Promise.all(
                favs.map(async (fav) => {
                    const url =
                        fav.media_type === "movie"
                            ? `https://api.themoviedb.org/3/movie/${fav.tmdb_id}?api_key=${TMDB_API_KEY}`
                            : `https://api.themoviedb.org/3/tv/${fav.tmdb_id}?api_key=${TMDB_API_KEY}`;

                    const res = await fetch(url);
                    const item = await res.json();

                    return { ...fav, item };
                })
            );

            setFavorites(enriched);
        } else {
            setFavorites([]);
        }

        setLoading(false);
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Banner */}
            <section className="relative h-[40vh] overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2000')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                <div className="relative container mx-auto px-4 h-full flex items-end pb-10">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-black/40 backdrop-blur-md border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-xl">
                                {userData?.avatar_url ? (
                                    <img
                                        src={userData.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-12 h-12 text-white/80" />
                                )}
                            </div>

                            {/* Change Avatar Button (Overlay) */}
                            <button
                                onClick={() => setEditAvatarOpen(true)}
                                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full border border-black shadow-lg transition-transform hover:scale-110"
                            >
                                <Camera size={16} />
                            </button>
                        </div>

                        {/* User Info */}
                        <div>
                            <h1 className="text-4xl font-bold text-white">
                                {userData?.username || "Your Profile"}
                            </h1>
                            <p className="text-gray-300 text-lg">
                                {userData?.email}
                            </p>

                            <button
                                onClick={() => setEditOpen(true)}
                                className="mt-4 px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition flex items-center gap-2 text-gray-200"
                            >
                                <Edit size={18} /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Favorites */}
            <section className="container mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">Your Favorites</h2>

                {favorites.length === 0 ? (
                    <p className="text-muted-foreground">You haven't added any favorites yet.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {favorites.map((fav) => {
                            const item = fav.item;
                            const isMovie = fav.media_type === "movie";

                            return isMovie ? (
                                <MovieCard
                                    key={fav.tmdb_id}
                                    id={item.id}
                                    title={item.title}
                                    posterPath={item.poster_path}
                                    rating={item.vote_average}
                                    releaseDate={item.release_date}
                                    onClick={() => navigate(`/movie/${item.id}`)}
                                />
                            ) : (
                                <SeriesCard
                                    key={fav.tmdb_id}
                                    id={item.id}
                                    name={item.name}
                                    posterPath={item.poster_path}
                                    rating={item.vote_average}
                                    firstAirDate={item.first_air_date}
                                    onClick={() => navigate(`/series/${item.id}`)}
                                />
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Edit Profile Modal */}
            <EditProfileModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                user={userData}
            />

            <EditAvatarModal
                open={editAvatarOpen}
                onClose={() => setEditAvatarOpen(false)}
                user={userData}
                onUpdate={loadProfile}
            />
        </div>
    );
}