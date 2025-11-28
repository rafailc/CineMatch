import { Star } from "lucide-react";
import { Card } from "../components/ui/card";

export default function SeriesCard({id, name, posterPath, rating, firstAirDate, seasons, episodes, onClick}) {
    const imageUrl = posterPath
        ? `https://image.tmdb.org/t/p/w500${posterPath}`
        : "/no-image.png";

    return (
        <Card
            className="group cursor-pointer overflow-hidden bg-card border-border/60 hover:border-accent/50
                 transition-all duration-300 hover:shadow-[0_8px_30px_-4px_hsl(280_82%_45%_/_0.3)]"
            onClick={onClick}
        >
            <div className="relative aspect-[2/3] overflow-hidden">
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover transform transition-transform duration-500
                           group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">

                    {/* Title + Rating */}
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white line-clamp-2">
                            {name}
                        </h3>

                        {rating && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/70 backdrop-blur-sm">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-medium text-white">
                                    {rating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Year */}
                    {firstAirDate && (
                        <p className="text-[11px] text-white/70">
                            {new Date(firstAirDate).getFullYear()}
                        </p>
                    )}

                    {/* ⭐ NEW: Seasons + Episodes */}
                    {(seasons || episodes) && (
                        <p className="text-[11px] text-white/60">
                            {seasons && `${seasons} Season${seasons > 1 ? "s" : ""}`}
                            {seasons && episodes ? " • " : ""}
                            {episodes && `${episodes} Episode${episodes > 1 ? "s" : ""}`}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
}