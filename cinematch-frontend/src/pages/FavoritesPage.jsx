import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import HorizontalCarousel from "@/components/HorizontalCarousel";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function analyzePreferredGenres(favoritesRows) {
    const genreCounts = {};
    let total = 0;

    for (const item of favoritesRows) {
        if (!Array.isArray(item.genres)) continue;

        for (const genre of item.genres) {
            if (!genre) continue;
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            total++;
        }
    }

    return Object.entries(genreCounts)
        .map(([genre, count]) => ({
            genre,
            percentage: Math.round((count / total) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage);
}


export default function FavoritesPage() {
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [preferredGenres, setPreferredGenres] = useState([]);
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

        const affinity = analyzePreferredGenres(data);
        setPreferredGenres(affinity);

        const { error: prefError } = await supabase
            .from("user_preferences")
            .upsert(
                {
                    user_id: user.id,
                    genre_affinity: affinity
                },
                { onConflict: "user_id" }
            );

        if (prefError) {
            console.error("Failed to store genre affinity:", prefError.message);
        }

        // Xorise ta movies kai series
        const movieItems = data.filter(item => item.media_type === "movie");
        const seriesItems = data.filter(item => item.media_type === "tv");

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

            {/* MOVIES SECTION */}
            <section className="mb-16">


                {movies.length === 0 ? (
                    <p className="text-muted-foreground">No favorite movies yet.</p>
                ) : (
                    <HorizontalCarousel title="Movies" items={movies} navigate={navigate} />
                )}
            </section>

            {/* SERIES SECTION */}
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

function FavoriteCard({ item, navigate }) {
    return (
        <div
            className="cursor-pointer group"
            onClick={() =>
                navigate(
                    item.media_type === "movie"
                        ? `/movie/${item.tmdb_id}`
                        : `/series/${item.tmdb_id}`
                )
            }
        >
            <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-md group-hover:shadow-lg transition-all duration-200">
                <img
                    src={
                        item.poster_path
                            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                            : "/placeholder_poster.png"
                    }
                    alt={item.title}
                    className="w-full h-[350px] object-cover group-hover:scale-105 transition-all duration-300"
                />
            </div>

            <h3 className="mt-3 font-semibold truncate group-hover:text-accent transition">
                {item.title}
            </h3>

            <p className="text-muted-foreground text-sm capitalize">
                {item.media_type}
            </p>
        </div>
    );
}