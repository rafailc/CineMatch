import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function FavoriteToggle({ item }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        checkIfFavorite();
    }, [item]);

    async function checkIfFavorite() {
        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
            setIsFavorite(false);
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

        if (isFavorite) {
            // REMOVE FAVORITE
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
            return;
        }

        // ADD FAVORITE
        const { error } = await supabase.from("user_favorites").insert({
            user_id: user.id,
            tmdb_id: item.id,
            title: item.title || item.name,
            genres: item.genres.map((g) => g.name),
            media_type: item.media_type
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Added to favorites!");
            setIsFavorite(true);
        }
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