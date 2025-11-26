import { Loader2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getTrendingMovies,getMovieDetails } from "../lib/tmdbBackend.js";

export default function Home() {

    const [loading, setLoading] = useState(true);
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        async function load() {
            const data = await getTrendingMovies(1);
            if (data?.results) setMovies(data.results);
            setLoading(false);
        }
        load();
    }, []);



    return (
        <>
            {/* Navigation removed */}

            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative h-[60vh] overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025')] bg-cover bg-center" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    </div>

                    <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
                        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            CineMatch
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
                            Discover movies, explore talent, and unlock AI-powered cinema insights
                        </p>
                    </div>
                </section>

                {/* Trending Movies */}
                <section className="container mx-auto px-4 py-12">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        <h2 className="text-3xl font-bold text-foreground">Trending Movies</h2>
                    </div>
                    {loading && (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin w-10 h-10 text-primary" />
                        </div>
                    )}

                    {!loading && movies.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {movies.slice(0, 10).map((movie) => (
                                <div
                                    key={movie.id}
                                    className="rounded-xl overflow-hidden bg-card shadow hover:scale-105 transition"
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-full h-[300px] object-cover"
                                    />

                                    <div className="p-4">
                                        <h3 className="font-semibold line-clamp-1">
                                            {movie.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            ⭐ {movie.vote_average.toFixed(1)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Trending People */}
                <section className="container mx-auto px-4 py-12">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp className="w-6 h-6 text-accent" />
                        <h2 className="text-3xl font-bold text-foreground">
                            Trending Actors & Directors
                        </h2>
                    </div>
                </section>
            </div>
        </>
    );
}
