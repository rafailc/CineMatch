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
 */import { useState, useEffect } from "react";
import { useNavigate, useSearchParams  } from "react-router-dom";
import { MovieCard } from "../components/MovieCard";
import { PersonCard } from "../components/PersonCard";
import { searchMovies, searchPerson, searchTv } from "../lib/tmdbBackend";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Search, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { getTrendingMovies, getTrendingPerson, getTrendingTv } from "../lib/tmdbBackend";
import FiltersSidebar from "../components/FiltersSidebar";
import SeriesCard from "../components/SeriesCard";
import { discoverMovies, discoverTV } from "../lib/tmdbBackend";

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
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const MOVIES_PER_PAGE = 20;
    const [isFiltered, setIsFiltered] = useState(false);


    const [filters, setFilters] = useState({
        genre: "",
        rating: 0,
        year: "",
        minRevenue: "",
        maxRevenue: ""
    });

    const [tvFilters, setTvFilters] = useState({
        genre: "",
        rating: 0,
        year: ""
    });

    useEffect(() => {
        const tab = searchParams.get("tab") || "movies";
        setActiveTab(tab);

        const initialPage = Number(searchParams.get("page")) || 1;
        setPage(initialPage);

        if (tab !== "movies") {
            void loadDefault(initialPage);
            return;
        }

        const restoredFilters = {
            genre: searchParams.get("genre") || "",
            rating: Number(searchParams.get("rating")) || 0,
            year: searchParams.get("year") || "",
            minRevenue: Number(searchParams.get("minRevenue")) || 0,
            maxRevenue: Number(searchParams.get("maxRevenue")) || 0
        };

        const hasFilters =
            restoredFilters.genre ||
            restoredFilters.year ||
            restoredFilters.rating > 0 ||
            restoredFilters.minRevenue > 0 ||
            restoredFilters.maxRevenue > 0;

        if (hasFilters) {
            setFilters(restoredFilters);
            setIsFiltered(true);
            applyFilters(restoredFilters);
        } else {
            setIsFiltered(false);
            void loadDefault(initialPage);
        }    }, []);

    useEffect(() => {
        setPage(1);

        if (query.trim()) {
            handleSearch(query, 1);
        } else {
            void loadDefault(1);
        }
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
    {/* HANDLER */}
    async function handleSearch(searchQuery, newPage = 1) {
        setQuery(searchQuery);
        setPage(newPage);

        if (!searchQuery || searchQuery.trim().length === 0) {
            await loadDefault(newPage);
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

    async function applyFilters(newFilters) {
        const noFilters =
            (!newFilters.genre || newFilters.genre === "") &&
            (!newFilters.year || newFilters.year === "") &&
            newFilters.rating === 0 &&
            (!newFilters.minRevenue || newFilters.minRevenue === 0) &&
            (!newFilters.maxRevenue || newFilters.maxRevenue === 0);

        setPage(1);

        if (noFilters) {
            await loadDefault();
            return;
        }

        const { genre, rating, year } = newFilters;

        const GENRES = {
            Action: 28,
            Adventure: 12,
            Animation: 16,
            Comedy: 35,
            Crime: 80,
            Documentary: 99,
            Drama: 18,
            Family: 10751,
            Fantasy: 14,
            History: 36,
            Horror: 27,
            Music: 10402,
            Mystery: 9648,
            Romance: 10749,
            ScienceFiction: 878,
            Thriller: 53,
            War: 10752,
            Western: 37
        };

        setLoading(true);

        let query = `?sort_by=popularity.desc&page=1`;

        if (genre && GENRES[genre]) query += `&with_genres=${GENRES[genre]}`;
        if (rating > 0) query += `&vote_average.gte=${rating}`;
        if (year?.length === 4) query += `&primary_release_year=${year}`;

        {/* BASE DISCOVERY QUERY */}
        let baseQuery = `?sort_by=popularity.desc`;

        if (newFilters.genre && GENRES[newFilters.genre])
            baseQuery += `&with_genres=${GENRES[newFilters.genre]}`;

        if (newFilters.rating > 0)
            baseQuery += `&vote_average.gte=${newFilters.rating}`;

        if (newFilters.year?.length === 4)
            baseQuery += `&primary_release_year=${newFilters.year}`;

        let allMovies = [];

        {/* FETCH FIRST 10 PAGES FOR SORTING */}
        for (let p = 1; p <= 10; p++) {
            const pageQuery = `${baseQuery}&page=${p}`;
            const data = await discoverMovies(pageQuery);

            if (!data?.results?.length) break;

            allMovies.push(...data.results);

            if (data.results.length < 20) break;

        }

        const data = await discoverMovies(query);
        {/*REVENUE DETAILS FOR EVERY MOVIE */}
        const detailedMovies = await Promise.all(
            allMovies.map(async (movie) => {
                try {
                    const res = await fetch(
                        `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`
                    );
                    const info = await res.json();
                    return { ...movie, revenue: info.revenue ?? 0 };
                } catch (err) {
                    return { ...movie, revenue: 0 };
                }
            })
        );

        {/* REVENUE FILTERING */}
        let filtered = detailedMovies;

        if (newFilters.minRevenue > 0)
            filtered = filtered.filter((m) => m.revenue >= newFilters.minRevenue);

        if (newFilters.maxRevenue > 0)
            filtered = filtered.filter((m) => m.revenue <= newFilters.maxRevenue);

        setMovies(filtered);
        setMovieTotal(filtered.length);

        setPeople([]);
        setPeopleTotal(0);

        setTotalPages(data.total_pages ?? 1);

        setLoading(false);
    }

    async function applyTVFilters(newFilters) {
        const noFilters =
            (!newFilters.genre || newFilters.genre === "") &&
            (!newFilters.year || newFilters.year === "") &&
            newFilters.rating === 0;

        if (noFilters) {
            await loadDefault();
            return;
        }

        const TV_GENRES = {
            "Action & Adventure": 10759,
            Animation: 16,
            Comedy: 35,
            Crime: 80,
            Documentary: 99,
            Drama: 18,
            Family: 10751,
            Kids: 10762,
            Mystery: 9648,
            News: 10763,
            Reality: 10764,
            "Sci-Fi & Fantasy": 10765,
            Soap: 10766,
            Talk: 10767,
            "War & Politics": 10768
        };

        const { genre, rating, year } = newFilters;

        let query = `?sort_by=popularity.desc&page=1`;

        if (genre && TV_GENRES[genre]) query += `&with_genres=${TV_GENRES[genre]}`;
        if (rating > 0) query += `&vote_average.gte=${rating}`;
        if (year?.length === 4) query += `&first_air_date_year=${year}`;

        const data = await discoverTV(query);

        setTV(data?.results ?? []);
        setTvTotal(Math.min(data?.total_results ?? 0, 10000));
        setTotalPages(data?.total_pages ?? 1);
    }

    function handleClientPagination(newPage) {
        setPage(newPage);
        // Scroll to the top when changing page
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const isCustomFiltered =
        activeTab === "movies" && isFiltered;

    const currentPageTotalPages = isCustomFiltered
        ? Math.ceil(movies.length / MOVIES_PER_PAGE) // Calculate pages based on local array length
        : totalPages; // Use the API's total pages

    const currentTotalResults = isCustomFiltered
        ? movies.length
        : movieTotal;

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
                        <Button
                            className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl"
                            onClick={() => setIsFiltersVisible(true)}
                        >
                            Filters
                        </Button>
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

                        {/* MOVIE GRID */}
                        <TabsContent value="movies">
                            <div className="relative">

                                <div className="lg:ml-0">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                        {(isCustomFiltered
                                                ? movies.slice(
                                                    (page - 1) * MOVIES_PER_PAGE,
                                                    page * MOVIES_PER_PAGE
                                                )
                                                : movies
                                        ).map((movie) => (
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
                    onClick={() => {
                        const newPage = page - 1;
                        setPage(newPage);

                        if (isCustomFiltered) {
                            handleClientPagination(newPage);
                        } else {
                            handleSearch(query, newPage);
                        }

                        setSearchParams(prev => {
                            prev.set("page", newPage);
                            prev.set("tab", activeTab);
                            return prev;
                        });

                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                >
                    Previous
                </Button>

                <span className="text-sm text-muted-foreground">
        Page {page} / {currentPageTotalPages}
    </span>

                <Button
                    variant="secondary"
                    disabled={page >= currentPageTotalPages || currentTotalResults === 0}
                    onClick={() => {
                        const newPage = page + 1;
                        setPage(newPage);

                        if (isCustomFiltered) {
                            handleClientPagination(newPage);
                        } else {
                            handleSearch(query, newPage);
                        }

                        setSearchParams(prev => {
                            prev.set("page", newPage);
                            prev.set("tab", activeTab);
                            return prev;
                        });

                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                >
                    Next
                </Button>
            </div>

            {isFiltersVisible && (
                <FiltersSidebar
                    filters={activeTab === "movies" ? filters : tvFilters}
                    mode={activeTab === "movies" ? "movie" : "tv"}
                    onApply={(updatedFilters) => {

                        // Checks if filters are empty before knowing which tab is loaded
                        const noFilters =
                            !updatedFilters.genre &&
                            !updatedFilters.year &&
                            updatedFilters.rating === 0 &&
                            !updatedFilters.minRevenue &&
                            !updatedFilters.maxRevenue;

                        if (activeTab === "movies") {
                            setFilters(updatedFilters);

                            if (noFilters) {
                                setIsFiltered(false);
                                setSearchParams({ tab: "movies" });
                                void loadDefault(1);
                            } else {
                                setIsFiltered(true);

                                setSearchParams({
                                    tab: "movies",
                                    genre: updatedFilters.genre || "",
                                    rating: updatedFilters.rating || "",
                                    year: updatedFilters.year || "",
                                    minRevenue: updatedFilters.minRevenue || "",
                                    maxRevenue: updatedFilters.maxRevenue || ""
                                });

                                applyFilters(updatedFilters);
                            }
                        } else {
                            setTvFilters(updatedFilters);

                            if (noFilters) {
                                setIsFiltered(false);
                                loadDefault(1);
                            } else {
                                setIsFiltered(true);
                                applyTVFilters(updatedFilters);
                            }
                        }

                        setIsFiltersVisible(false);
                    }}
                    onClose={() => setIsFiltersVisible(false)}
                />

            )}

        </div>
    );
}
