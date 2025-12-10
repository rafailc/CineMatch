import { useState} from "react";
import "../styles/slider.css";
import "../styles/year.css";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";


export default function FiltersSidebar({ filters, mode, onApply, onClose }) {

    // Local sidebar state (independent)
    const [localFilters, setLocalFilters] = useState(filters);



    const genresMovie = [
        "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
        "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
        "Romance", "Sci-Fi", "Thriller", "War", "Western"
    ];

    const genresTV = [
        "Action","Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama",
        "Family", "Kids", "Mystery", "News", "Reality", "Sci-Fi", "Fantasy",
        "Soap", "Talk", "War"
    ];

    const activeGenres = mode === "movie" ? genresMovie : genresTV;


    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 right-0 h-full w-80 bg-[#0f1117] shadow-2xl p-4 z-50 overflow-y-auto"
        >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Filters</h2>
                <Button variant="ghost" onClick={onClose}>
                    <X />
                </Button>
            </div>

            <Card className="bg-[#141820] border-none shadow-none">
                <CardContent>
                    <div className="space-y-6">

                        {/* GENRE FILTER */}
                        <div>
                            <p className="text-sm font-semibold mb-2">Genre</p>

                            <div className="grid grid-cols-3 gap-2">
                                {activeGenres.map((g) => (
                                    <Button
                                        key={g}
                                        variant={localFilters.genre === g ? "default" : "outline"}
                                        className="text-xs rounded-xl whitespace-nowrap px-3 py-2"
                                        onClick={() =>
                                            setLocalFilters({
                                                ...localFilters,
                                                genre: localFilters.genre === g ? "" : g
                                            })
                                        }
                                    >
                                        {g}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* RATING FILTER */}
                        <div>
                            <p className="text-sm font-semibold mb-2">Minimum Rating</p>

                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="1"
                                value={localFilters.rating}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        rating: Number(e.target.value)
                                    })
                                }
                                className="rating-slider w-full"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-[#11D6D0] font-semibold">
                                    {localFilters.rating}+
                                </span>
                            </p>
                        </div>

                        {/* YEAR FILTER */}
                        <div>
                            <p className="text-sm font-semibold mb-2">Release Year</p>
                            <input
                                type="text"
                                placeholder="e.g. 2020"
                                value={localFilters.year}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        year: e.target.value
                                    })
                                }
                                className="w-full px-3 py-2 rounded-md bg-[#141820] border border-gray-700"
                            />
                        </div>

                        {/* REVENUE FILTER */}
                        <div className="mt-4">
                            <p className="text-sm font-semibold mb-2">Revenue Range (USD)</p>

                            {/* MIN REVENUE */}
                            <input
                                type="number"
                                placeholder="Min revenue"
                                value={localFilters.minRevenue || ""}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        minRevenue: Number(e.target.value)
                                    })
                                }
                                className="w-full px-3 py-2 rounded-md bg-[#141820] border border-gray-700 text-white mb-2"
                            />

                            {/* MAX REVENUE */}
                            <input
                                type="number"
                                placeholder="Max revenue"
                                value={localFilters.maxRevenue || ""}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        maxRevenue: Number(e.target.value)
                                    })
                                }
                                className="w-full px-3 py-2 rounded-md bg-[#141820] border border-gray-700 text-white"
                            />

                            <p className="text-xs text-muted-foreground mt-1">Enter revenue range</p>
                        </div>


                        <div className="flex flex-col gap-2 mt-6">

                            {/* APPLY BUTTON */}
                            <Button
                                className="rounded-xl w-full bg-[#11D6D0]"
                                onClick={() => onApply(localFilters)}
                            >
                                Apply Filters
                            </Button>
                            {/*CLEAR BUTTON */}
                            <Button
                                variant="destructive"
                                className="rounded-xl w-full"
                                onClick={() => {
                                    const cleared = {
                                        genre: "",
                                        rating: 0,
                                        year: "",
                                        sort: ""
                                    };
                                    setLocalFilters(cleared);
                                    onApply(cleared);
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}