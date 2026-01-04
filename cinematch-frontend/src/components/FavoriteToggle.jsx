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
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { recomputeAndStoreGenreAffinity } from "@/lib/affinity";

export default function FavoriteToggle({ item }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkIfFavorite();
    }, [item]);

    async function checkIfFavorite() {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setIsFavorite(false);
            setLoading(false);
            return;
        }

        const { data } = await supabase
            .from("user_favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("tmdb_id", item.id)
            .eq("media_type", item.media_type)
            .maybeSingle();

        setIsFavorite(!!data);
        setLoading(false);
    }

    async function toggleFavorite() {
        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
            toast.error("You must be logged in.");
            return;
        }


        const genres =
            Array.isArray(item.genres) ? item.genres.map(g => g.name) :
                Array.isArray(item.genre_ids) ? item.genre_ids :
                    [];

        if (isFavorite) {
            const { error } = await supabase
                .from("user_favorites")
                .delete()
                .eq("user_id", user.id)
                .eq("tmdb_id", item.id)
                .eq("media_type", item.media_type);

            if (error) {
                toast.error("Failed to remove from favorites.");
                return;
            }

            toast.success("Removed from favorites");
            setIsFavorite(false);
            recomputeAndStoreGenreAffinity(user.id).catch(console.error);
            return;
        }

        const { error } = await supabase.from("user_favorites").insert({
            user_id: user.id,
            tmdb_id: item.id,
            title: item.title || item.name,
            genres: Array.isArray(genres) ? genres : [],
            media_type: item.media_type,
        });

        if (error) {
            toast.error(error.message);
            return;
        }
        setIsFavorite(true);
        toast.success("Added to favorites!");
        recomputeAndStoreGenreAffinity(user.id).catch(console.error);
    }

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className="p-3 rounded-full bg-card border border-border hover:bg-card/70 transition flex items-center justify-center"
        >
            <Heart
                className={`w-6 h-6 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                }`}
            />
        </button>
    );
}
