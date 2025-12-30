import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieDetails, calculateEngagementScore } from "../lib/tmdbBackend";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { PersonCard } from "../components/PersonCard";
import { Loader2, Star, TrendingUp, DollarSign, Clock, Calendar,MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {supabase} from "@/lib/supabase.js";
import FavoriteToggle from "../components/FavoriteToggle";
import {Button} from "@/components/ui/button.jsx";
import ReviewModal from "../components/ReviewModal";

export default function MovieDetailsPage() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        if (id) {
            loadMovieDetails(parseInt(id));
        }
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

    async function loadMovieDetails(movieId) {
        try {
            setLoading(true);
            const details = await getMovieDetails(movieId);
            setMovie(details);
        } catch (error) {
            toast.error("Failed to load movie details");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background pt-16">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background pt-16">
                <p className="text-muted-foreground">Movie not found</p>
            </div>
        );
    }

    const backdropUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : null;
    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;
    const engagementScore = calculateEngagementScore(movie);

    return (
        <div className="min-h-screen bg-background pt-16">

            {/* BACK BUTTON */}
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

            {/* HERO BACKDROP */}
            <section className="relative h-[65vh] overflow-hidden">
                {backdropUrl && (
                    <>
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${backdropUrl})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                    </>
                )}
            </section>

            {/* MAIN CONTENT (Poster + Info Column) */}
            <div className="container mx-auto px-6 -mt-48 relative z-10 pb-16">
                <div className="flex flex-col md:flex-row gap-10 items-start">

                    {/* POSTER */}
                    {posterUrl && (
                        <img
                            src={posterUrl}
                            alt={movie.title}
                            className="w-64 rounded-xl shadow-xl border border-border"
                        />
                    )}

                    {/* RIGHT COLUMN (Title, Genres, Info, KPIs) */}
                    <div className="flex-1 max-w-3xl">

                        {/* TITLE */}
                        <div className="flex items-center justify-between">
                            <h1 className="text-5xl font-bold mb-4 text-foreground">
                                {movie.title}
                            </h1>

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
                                    id: movie.id,
                                    title: movie.title,
                                    genres: movie.genres,
                                    media_type: "movie"
                                }}
                            />
                        </div>
                        </div>

                        {/* GENRES */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {movie.genres.map((genre) => (
                                <Badge key={genre.id} variant="secondary">
                                    {genre.name}
                                </Badge>
                            ))}
                        </div>

                        {/* YEAR / LENGTH / RATING */}
                        <div className="flex flex-wrap gap-6 text-muted-foreground mb-10">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(movie.release_date).getFullYear()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{movie.runtime} min</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 fill-accent text-accent" />
                                <span>{movie.vote_average.toFixed(1)}/10</span>
                            </div>
                        </div>

                        {/* KPI CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                            <Card className="p-6 bg-card border-border">
                                <div className="flex items-center gap-3 mb-2">
                                    <TrendingUp className="w-5 h-5 text-accent" />
                                    <h3 className="font-semibold text-foreground">Engagement Score</h3>
                                </div>
                                <p className="text-3xl font-bold text-accent">
                                    {engagementScore}/100
                                </p>
                            </Card>

                            <Card className="p-6 bg-card border-border">
                                <div className="flex items-center gap-3 mb-2">
                                    <Star className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold text-foreground">Popularity Index</h3>
                                </div>
                                <p className="text-3xl font-bold text-primary">
                                    {Math.round(movie.popularity)}
                                </p>
                            </Card>

                            <Card className="p-6 bg-card border-border">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="w-5 h-5 text-accent" />
                                    <h3 className="font-semibold text-foreground">Box Office</h3>
                                </div>
                                <p className="text-3xl font-bold text-accent">
                                    ${(movie.revenue / 1000000).toFixed(0)}M
                                </p>
                            </Card>
                        </div>

                    </div>
                </div>

                {/* OVERVIEW */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">Overview</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        {movie.overview}
                    </p>
                </section>

                {/* CAST */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-foreground">Cast</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {movie.cast.slice(0, 12).map((member) => (
                            <PersonCard
                                key={member.id}
                                id={member.id}
                                name={member.name}
                                profilePath={member.profile_path}
                                knownFor={member.character}
                                onClick={() => navigate(`/person/${member.id}`)}
                            />
                        ))}
                    </div>
                </section>

            </div>

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                contentId={movie.id}
                contentType="movie"
            />

        </div>
    );
}