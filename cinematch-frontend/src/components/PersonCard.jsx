import { Card } from "../components/ui/card";

export function PersonCard({ name, profilePath, knownFor, onClick }) {
    const imageUrl = profilePath
        ? `https://image.tmdb.org/t/p/w500${profilePath}`
        : "https://via.placeholder.com/500x750?text=No+Image";

    return (
        <Card
            className="group cursor-pointer overflow-hidden bg-card border-border/60 hover:border-accent/50
                 transition-all duration-300 hover:shadow-[0_8px_30px_-4px_hsl(180_82%_45%_/_0.3)]"
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
                    <h3 className="text-sm font-semibold text-white line-clamp-2">{name}</h3>
                    {knownFor && (
                        <p className="text-[11px] text-white/70">
                            Known for: {knownFor}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
}