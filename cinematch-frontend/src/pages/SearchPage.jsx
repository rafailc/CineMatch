import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MovieCard } from "../components/MovieCard";
import { PersonCard } from "../components/PersonCard";
import { searchMovies, searchPerson, searchTv } from "../lib/tmdbBackend";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Search, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { getTrendingMovies, getTrendingPerson, getTrendingTv } from "../lib/tmdbBackend";

import SeriesCard from "../components/SeriesCard";




export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [people, setPeople] = useState([]);
    const [movieTotal, setMovieTotal] = useState(0);
    const [peopleTotal, setPeopleTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [tv, setTV] = useState([]);
    const [tvTotal, setTvTotal] = useState(0);
    const [activeTab, setActiveTab] = useState("movies");




    useEffect(() => {
        loadDefault(1);
    }, []);

    useEffect(() => {
        setPage(1);
        handleSearch(query, 1);
    }, [activeTab]);

    async function loadDefault(page = 1) {
        try {
            setLoading(true);

            const movieRes = await getTrendingMovies(page);
            const peopleRes = await getTrendingPerson(page);
            const tvRes = await getTrendingTv(page);

            setMovies(movieRes?.results ?? []);
            setMovieTotal(movieRes?.total_results ?? 0);

            setPeople(peopleRes?.results ?? []);
            setPeopleTotal(peopleRes?.total_results ?? 0);

            setTV(tvRes?.results ?? []);
            setTvTotal(tvRes?.total_results ?? 0);

            setTotalPages(movieRes?.total_pages ?? 1);
        } finally {
            setLoading(false);
        }
    }


    // SEARCH HANDLER

    async function handleSearch(searchQuery, newPage = 1) {
        setQuery(searchQuery);
        setPage(newPage);

        // EMPTY SEARCH → RESET TO DEFAULT (correct page)
        if (!searchQuery || searchQuery.trim().length === 0) {
            await loadDefault(newPage);   // FIXED
            return;
        }

        try {
            setLoading(true);

            const movieRes = await searchMovies(searchQuery, newPage);
            const peopleRes = await searchPerson(searchQuery, newPage);
            const tvRes = await searchTv(searchQuery, newPage);

            setMovies(movieRes?.results ?? []);
            setMovieTotal(movieRes?.total_results ?? 0);

            setPeople(peopleRes?.results ?? []);
            setPeopleTotal(peopleRes?.total_results ?? 0);

            setTV(tvRes?.results ?? []);
            setTvTotal(tvRes?.total_results ?? 0);

            setTotalPages(movieRes?.total_pages ?? 1);
        } finally {
            setLoading(false);
        }
    }



    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Search CineMatch
                    </h1>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search for movies, actors, or directors..."
                            value={query}
                            onChange={(e) => {
                                const v = e.target.value;
                                setQuery(v);
                                handleSearch(v, 1);
                            }}
                            className="pl-12 h-14 text-lg bg-card border-border focus-visible:ring-accent"
                        />
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    </div>
                )}

                {!loading && (movies.length > 0 || people.length > 0) && (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8">
                            <TabsTrigger value="movies">Movies ({movieTotal})</TabsTrigger>
                            <TabsTrigger value="tv">Series ({tvTotal})</TabsTrigger>
                            <TabsTrigger value="people">People ({peopleTotal})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="movies">
                            <div className="relative">


                                {/* MOVIE GRID –  */}
                                <div className="lg:ml-0">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
                                </div>

                            </div>
                        </TabsContent>

                        <TabsContent value="tv">
                            <div className="relative">



                                {/* TV GRID */}
                                <div className="lg:ml-0">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start">
                                        {tv.map(show => (
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
                                </div>

                            </div>
                        </TabsContent>

                        <TabsContent value="people">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {people.map((person) => (
                                    <PersonCard
                                        key={person.id}
                                        id={person.id}
                                        name={person.name}
                                        profilePath={person.profile_path}
                                        knownFor={person.known_for_department}
                                        onClick={() => navigate(`/person/${person.id}`)}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}

                {!loading && query && movies.length === 0 && people.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                            No results found for "{query}"
                        </p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center gap-4 py-6">
                <Button
                    variant="secondary"
                    disabled={page === 1}
                    onClick={() => handleSearch(query, page - 1)}
                >
                    Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                    Page {page} / {totalPages}
                </span>

                <Button
                    variant="secondary"
                    disabled={page === totalPages}
                    onClick={() => handleSearch(query, page + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}