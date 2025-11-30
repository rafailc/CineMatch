import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPersonDetails, calculateStarPower } from "../lib/tmdbBackend";
import { Card } from "../components/ui/card.jsx";
import { MovieCard } from "../components/MovieCard.jsx";
import { Loader2, Star, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function PersonDetailsPage() {
    const { id } = useParams();
    const [person, setPerson] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            loadPersonDetails(parseInt(id));
        }
    }, [id]);

    async function loadPersonDetails(personId) {
        try {
            setLoading(true);
            const details = await getPersonDetails(personId);
            setPerson(details);
        } catch (error) {
            toast.error("Failed to load person details");
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

    if (!person) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background pt-16">
                <p className="text-muted-foreground">Person not found</p>
            </div>
        );
    }

    const profileUrl = person.profile_path
        ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
        : null;
    const starPower = calculateStarPower(person);

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">

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

            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-12">
                    {/* Profile Section */}
                    <div>
                        {profileUrl && (
                            <img
                                src={profileUrl}
                                alt={person.name}
                                className="w-full rounded-lg shadow-2xl mb-6"
                            />
                        )}
                        <Card className="p-6 bg-card border-border">
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="w-5 h-5 text-accent" />
                                    <h3 className="font-semibold text-foreground">Star Power</h3>
                                </div>
                                <p className="text-3xl font-bold text-accent">{starPower}/100</p>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-muted-foreground">Born</p>
                                        <p className="text-foreground">{person.birthday}</p>
                                    </div>
                                </div>
                                {person.place_of_birth && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-muted-foreground">Birthplace</p>
                                            <p className="text-foreground">{person.place_of_birth}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Info Section */}
                    <div>
                        <h1 className="text-5xl font-bold mb-4 text-foreground">{person.name}</h1>
                        <p className="text-accent mb-8">{person.known_for_department}</p>

                        {person.biography && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold mb-4 text-foreground">Biography</h2>
                                <p className="text-muted-foreground leading-relaxed">{person.biography}</p>
                            </section>
                        )}

                        {/* Known For Movies */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6 text-foreground">Known For</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {person.movie_credits.cast
                                    .sort((a, b) => b.popularity - a.popularity)
                                    .slice(0, 8)
                                    .map((movie) => (
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
                    </div>
                </div>
            </div>
        </div>
    );
}