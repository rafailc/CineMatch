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
 */import { Loader2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getTrendingMovies,getMovieDetails, getTrendingTv, getTrendingPerson } from "../lib/tmdbBackend.js";
import { MovieCard } from "../components/MovieCard.jsx";
import  SeriesCard  from "../components/SeriesCard.jsx";
import { PersonCard } from "../components/PersonCard.jsx";
import { useNavigate } from "react-router-dom";

export default function Home() {

    const [loading, setLoading] = useState(true);
    const [movies, setMovies] = useState([]);
    const [tv, setTv] = useState([]);
    const [person, setPerson] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            const [movieData, tvData, personData] = await Promise.all([
                getTrendingMovies(1),
            getTrendingTv(1),
            getTrendingPerson(1),
            ]);

            setMovies(movieData.results.slice(0, 12));
            setPerson(personData.results.slice(0, 16));
            setTv(tvData.results.slice(0, 12));

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

                {/* Trending TV */}
                <section className="container mx-auto px-4 py-12">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp className="w-6 h-6 text-secondary" />
                        <h2 className="text-3xl font-bold text-foreground">Trending TV Series</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {tv.map((show) => (
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

                {/* Trending People */}
                <section className="container mx-auto px-4 py-12">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp className="w-6 h-6 text-accent" />
                        <h2 className="text-3xl font-bold text-foreground">
                            Trending Actors & Directors
                        </h2>
                    </div>

                    {loading && (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin w-10 h-10 text-primary" />
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
                        {person.map((person) => (
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
                </section>
                <div className="w-full flex justify-center py-10 mt-12">
                    <button
                        onClick={() => navigate("/about")}
                        className="px-5 py-2 text-sm rounded-lg
                   bg-white/10 backdrop-blur-md
                   text-gray-200 border border-white/20
                   hover:bg-white/20 transition"
                    >
                        About Us
                    </button>
                </div>

            </div>
        </>
    );
}
