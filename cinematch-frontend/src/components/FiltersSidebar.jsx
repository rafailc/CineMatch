import { useState, useEffect } from "react";
import GenreRadioGroup from "./GenreRadioGroup";
import "../styles/slider.css";
import "../styles/year.css";

export default function FiltersSidebar({ filters, onFilterChange, mode }) {

    // Local sidebar state (independent)
    const [selectedGenre, setSelectedGenre] = useState(filters.genre);
    const [minRating, setMinRating] = useState(filters.rating);
    const [year, setYear] = useState(filters.year);


    useEffect(() => {

        if (filters.genre === "" && filters.rating === 0 && filters.year === "") {
            setSelectedGenre("");
            setMinRating(0);
            setYear("");
        }
    }, [filters]);

    const MOVIE_GENRES = [
        "Action", "Crime", "Comedy",
        "Animation", "Sci-Fi", "Drama",
        "Thriller", "Horror", "Adventure",
        "Romance", "Fantasy"
    ];

    const TV_GENRES = [
        "Action", "Crime", "Comedy",
        "Animation", "Sci-Fi", "Drama",
        "Kids", "Reality", "Family",
        "Soap", "War"
    ];

    const genres = mode === "movie" ? MOVIE_GENRES : TV_GENRES;

    function applyFilters() {
        onFilterChange({
            genre: selectedGenre,
            rating: minRating,
            year: year
        });
    }

    function clearFilters() {
        setSelectedGenre("");
        setMinRating(0);
        setYear("");

        onFilterChange({
            genre: "",
            rating: 0,
            year: ""
        });
    }

    return (
        <div className="bg-card border border-border p-6 rounded-xl shadow-md text-white sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Filters</h2>

            {/* GENRE */}
            <div className="mb-5">
                <label className="text-sm text-muted-foreground">Genre</label>

                <GenreRadioGroup
                    genres={genres}
                    value={selectedGenre}
                    onChange={setSelectedGenre}
                />
            </div>

            {/* RATING */}
            <div className="mb-5">
                <label className="text-sm text-muted-foreground">Minimum Rating</label>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={minRating}
                    className="rating-slider mt-2 w-full"
                    onChange={(e) => setMinRating(Number(e.target.value))}
                />
                <p className="mt-1 text-accent font-semibold">{minRating}+</p>
            </div>

            {/* YEAR */}
            <div className="mb-5">
                <label className="text-sm text-muted-foreground">Release Year</label>
                <input
                    type="number"
                    placeholder="e.g. 2020"
                    className="year-input mt-2"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                />
            </div>

            {/* APPLY BUTTON */}
            <button
                onClick={applyFilters}
                className="w-full mt-4 py-2 rounded-lg bg-accent hover:opacity-90 transition"
            >
                Apply Filters
            </button>

            {/* CLEAR FILTERS */}
            <button
                onClick={clearFilters}
                className="w-full mt-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
            >
                Clear Filters
            </button>
        </div>
    );
}