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
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import HorizontalCarousel from "@/components/HorizontalCarousel";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function FavoritesPage() {
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadFavorites();
    }, []);

    async function loadFavorites() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            toast.error("Please log in to view favorites.");
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from("user_favorites")
            .select("*")
            .eq("user_id", user.id);

        if (error) {
            toast.error("Failed to load favorites");
            setLoading(false);
            return;
        }

        const movieItems = data.filter((item) => item.media_type === "movie");
        const seriesItems = data.filter((item) => item.media_type === "tv");

        // Fetch tmdb details ksexorista
        const moviesWithPosters = await Promise.all(
            movieItems.map(fetchTMDBDetails)
        );

        const seriesWithPosters = await Promise.all(
            seriesItems.map(fetchTMDBDetails)
        );

        setMovies(moviesWithPosters);
        setSeries(seriesWithPosters);
        setLoading(false);
    }

    async function fetchTMDBDetails(item) {
        const endpoint =
            item.media_type === "movie"
                ? `movie/${item.tmdb_id}`
                : `tv/${item.tmdb_id}`;

        const res = await fetch(
            `https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_API_KEY}`
        );
        const tmdbData = await res.json();

        return {
            ...item,
            poster_path: tmdbData.poster_path,
            title: tmdbData.title || tmdbData.name,
        };
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 px-6 pb-20">
            <h1 className="text-4xl font-bold mb-10">My Favorites</h1>

            <section className="mb-16">
                {movies.length === 0 ? (
                    <p className="text-muted-foreground">No favorite movies yet.</p>
                ) : (
                    <HorizontalCarousel title="Movies" items={movies} navigate={navigate} />
                )}
            </section>

            <section>
                {series.length === 0 ? (
                    <p className="text-muted-foreground">No favorite series yet.</p>
                ) : (
                    <HorizontalCarousel title="Series" items={series} navigate={navigate} />
                )}
            </section>
        </div>
    );
}
