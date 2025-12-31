import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { MovieCard } from "../components/MovieCard.jsx";
import SeriesCard from "../components/SeriesCard.jsx";
import SpinWheel from "../components/SpinWheel.jsx";

import { supabase } from "../lib/supabase";
import {
    discoverMovies,
    discoverTV,
    getTrendingMovies,
    getTrendingTv,
} from "../lib/tmdbBackend.js";

function topGenresFromReviews(reviews, contentType, max = 6) {
    const w = new Map();

    for (const r of reviews || []) {
        // only for this type
        if (r.content_type !== contentType) continue;

        // sentiment normalize
        const s = (r?.sentiment ?? "").toString().toLowerCase();
        if (s !== "positive") continue;

        // genre ids normalize
        const gids = Array.isArray(r.genre_ids)
            ? r.genre_ids.map(Number).filter(Number.isFinite)
            : [];

        if (!gids.length) continue;

        const weight = typeof r.sentiment_score === "number" ? r.sentiment_score : 1;

        for (const gid of gids) {
            w.set(gid, (w.get(gid) || 0) + weight);
        }
    }

    return [...w.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, max)
        .map(([gid]) => gid);
}

export default function SuggestPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [movieWheelOpen, setMovieWheelOpen] = useState(false);
    const [seriesWheelOpen, setSeriesWheelOpen] = useState(false);

    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);

                const { data: sessionData } = await supabase.auth.getSession();
                const userId = sessionData?.session?.user?.id;
                if (!userId) throw new Error("You must be logged in.");

                const { data: myReviews, error: myErr } = await supabase
                    .from("reviews")
                    .select("content_id, content_type, sentiment, sentiment_score, genre_ids")
                    .eq("user_id", userId);

                if (myErr) throw new Error(myErr.message);

                const reviewedMovieIds = new Set(
                    (myReviews || [])
                        .filter((r) => r.content_type === "movie")
                        .map((r) => Number(r.content_id))
                        .filter(Number.isFinite)
                );

                const reviewedSeriesIds = new Set(
                    (myReviews || [])
                        .filter((r) => r.content_type === "series")
                        .map((r) => Number(r.content_id))
                        .filter(Number.isFinite)
                );

                // ✅ separate genre learning
                const movieGenres = topGenresFromReviews(myReviews, "movie", 6);
                const seriesGenres = topGenresFromReviews(myReviews, "series", 6);

                // helpers: load trending per section
                const loadTrendingMovies = async () => {
                    const m = await getTrendingMovies(1);
                    setMovies((m?.results || []).slice(0, 12));
                };
                const loadTrendingSeries = async () => {
                    const t = await getTrendingTv(1);
                    setSeries((t?.results || []).slice(0, 12));
                };

                // ✅ MOVIES
                if (!movieGenres.length) {
                    await loadTrendingMovies();
                } else {
                    const movieQuery = `?with_genres=${movieGenres.join(
                        ","
                    )}&sort_by=popularity.desc&page=1`;

                    const md = await discoverMovies(movieQuery);
                    const mdResults = Array.isArray(md?.results) ? md.results : [];

                    const nextMovies = mdResults
                        .filter((x) => !reviewedMovieIds.has(x.id))
                        .slice(0, 12);

                    // if discover gives nothing -> fallback trending movies
                    if (!nextMovies.length) await loadTrendingMovies();
                    else setMovies(nextMovies);
                }

                // ✅ SERIES
                if (!seriesGenres.length) {
                    await loadTrendingSeries();
                } else {
                    const tvQuery = `?with_genres=${seriesGenres.join(
                        ","
                    )}&sort_by=popularity.desc&page=1`;

                    const td = await discoverTV(tvQuery);
                    const tdResults = Array.isArray(td?.results) ? td.results : [];

                    const nextSeries = tdResults
                        .filter((x) => !reviewedSeriesIds.has(x.id))
                        .slice(0, 12);

                    // if discover gives nothing -> fallback trending series
                    if (!nextSeries.length) await loadTrendingSeries();
                    else setSeries(nextSeries);
                }
            } catch (e) {
                console.error("SuggestPage error:", e);
                setError(e?.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading)
        return (
            <div className="min-h-screen bg-background pt-20 px-6">
                Loading suggestions…
            </div>
        );

    if (error)
        return (
            <div className="min-h-screen bg-background pt-20 px-6 text-red-400">
                {error}
            </div>
        );

    return (
        <div className="min-h-screen bg-background pt-20 px-6 container mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold">Suggestions</h1>
            </div>

            <section className="py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-foreground">Movies</h2>
                    <button
                        onClick={() => setMovieWheelOpen(true)}
                        disabled={!movies.length}
                        className={`px-4 py-2 rounded-lg border
                                ${
                            !movies.length
                                ? "bg-white/5 text-white/40 border-white/10 cursor-not-allowed"
                                : "bg-white/10 hover:bg-white/20 border-white/10"
                        }`}
                    >
                        Can’t decide? Spin 🎡
                    </button>
                </div>


                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {movies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            id={movie.id}
                            title={movie.title}
                            posterPath={movie.poster_path}
                            rating={movie.vote_average}
                            releaseDate={movie.release_date}
                            onClick={() => navigate(`/movie/${movie.id}`)}
                        />
                    ))}
                </div>
            </section>


            <section className="py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-foreground">TV Series</h2>
                    <button
                        onClick={() => setSeriesWheelOpen(true)}
                        disabled={!series.length}
                        className={`px-4 py-2 rounded-lg border
                                ${
                            !series.length
                                ? "bg-white/5 text-white/40 border-white/10 cursor-not-allowed"
                                : "bg-white/10 hover:bg-white/20 border-white/10"
                        }`}
                    >
                        Can’t decide? Spin 🎡
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {series.map((show) => (
                        <SeriesCard
                            key={show.id}
                            id={show.id}
                            name={show.name}
                            posterPath={show.poster_path}
                            rating={show.vote_average}
                            firstAirDate={show.first_air_date}
                            onClick={() => navigate(`/series/${show.id}`)}
                        />
                    ))}
                </div>
            </section>
            <SpinWheel
                open={movieWheelOpen}
                onClose={() => setMovieWheelOpen(false)}
                items={movies}
                title="Movie Wheel"
                goLabel="Go to movie"
                onPick={(m) => {
                    setMovieWheelOpen(false);
                    navigate(`/movie/${m.id}`);
                }}
            />

            <SpinWheel
                open={seriesWheelOpen}
                onClose={() => setSeriesWheelOpen(false)}
                items={series}
                title="TV Series Wheel"
                goLabel="Go to series"
                onPick={(s) => {
                    setSeriesWheelOpen(false);
                    navigate(`/series/${s.id}`);
                }}
            />

        </div>
    );
}