import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, MessageSquare } from "lucide-react";
import { getTvDetails } from "../lib/tmdbBackend";
import { PersonCard } from "../components/PersonCard";
import FavoriteToggle from "../components/FavoriteToggle";
import ReviewModal from "../components/ReviewModal";
import {supabase} from "@/lib/supabase.js";
import {Button} from "@/components/ui/button.jsx"

export default function TvDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [series, setSeries] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        loadSeries();
    }, [id]);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setCurrentUserId(session.user.id);
            }
        };
        fetchUser();
    }, []);

    async function loadSeries() {
        try {
            setLoading(true);
            const data = await getTvDetails(id);
            setSeries(data);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    if (!series) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Failed to load series.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white">

            <button
                onClick={() => navigate(-1)}
                className="fixed top-3 left-44 z-50
               px-3 py-2 rounded-lg
               bg-card border border-border
               hover:bg-card/80 transition
               flex items-center gap-2"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-5"
                >
                    <path d="M15 18l-6-6 6-6" />
                </svg>
                <span className="hidden sm:inline">Back</span>
            </button>

            {/* Backdrop — same style as movies */}
            <div className="relative w-full h-[75vh]">
                <img
                    src={`https://image.tmdb.org/t/p/original${series.backdrop_path}`}
                    alt=""
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>

            <div className="container mx-auto px-6 -mt-48 relative z-10">
                <div className="flex flex-col md:flex-row gap-10 items-start">

                    {/* POSTER — Aristera opos stis tainies */}
                    <img
                        src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
                        alt={series.name}
                        className="w-64 rounded-xl shadow-xl border border-border"
                    />

                    {/* INFO CONTENT */}
                    <div className="max-w-3xl">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-5xl font-bold">{series.name}</h1>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="gap-2 bg-card text-card-foreground border-border hover:bg-gradient-to-br hover:from-red-700 hover:to-blue-600 hover:text-white transition-all"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Reviews
                                </Button>

                            <FavoriteToggle
                                item={{
                                    id: series.id,
                                    name: series.name,
                                    genres: series.genres,
                                    media_type: "tv"
                                }}
                            />
                            </div>
                        </div>

                        {/* Rating + Year */}
                        <p className="text-muted-foreground mb-4 text-lg">
                            ⭐ {series.vote_average.toFixed(1)} · {series.first_air_date?.slice(0, 4)}
                        </p>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {series.genres.map((genre) => (
                                <span
                                    key={genre.id}
                                    className="px-3 py-1 bg-card border border-border rounded-full text-sm"
                                >
                                    {genre.name}
                                </span>
                            ))}
                        </div>

                        {/* Overview */}
                        <h2 className="text-2xl font-semibold mb-2">Overview</h2>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            {series.overview}
                        </p>

                        {/* Seasons */}
                        <h2 className="text-2xl font-semibold mb-4">Seasons</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                            {series.seasons?.map((season) => (
                                <div
                                    key={season.id}
                                    className="p-4 bg-card border border-border rounded-xl"
                                >
                                    <h3 className="text-lg font-semibold">{season.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Episodes: {season.episode_count}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Air Date: {season.air_date || "N/A"}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Cast */}
                        <h2 className="text-2xl font-semibold mb-4">Cast</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
                            {series.cast.slice(0, 12).map((person) => (
                                <PersonCard
                                    key={person.id}
                                    id={person.id}
                                    name={person.name}
                                    knownFor={person.character}
                                    profilePath={person.profile_path}
                                    onClick={() => navigate(`/person/${person.id}`)}
                                />
                            ))}
                        </div>

                    </div>
                </div>
            </div>
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                contentId={series.id}
                contentType="series"
            />
        </div>
    );
}