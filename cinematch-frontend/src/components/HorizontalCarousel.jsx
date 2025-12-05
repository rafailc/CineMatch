import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export default function HorizontalCarousel({ title, items, navigate }) {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (!scrollRef.current) return;

        const cardWidth = 250; // poster + spacing
        const amount = direction === "left" ? -cardWidth * 3 : cardWidth * 3;

        scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    };

    return (
        <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">{title}</h2>
            </div>

            <div className="relative">
                {/* LEFT ARROW */}
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20
                     bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                {/* SCROLLABLE ROW */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-scroll no-scrollbar gap-6 px-10"
                    style={{ scrollBehavior: "smooth" }}
                >
                    {items.map((item) => (
                        <div
                            key={item.tmdb_id}
                            className="cursor-pointer group min-w-[220px]"
                            onClick={() =>
                                navigate(
                                    item.media_type === "movie"
                                        ? `/movie/${item.tmdb_id}`
                                        : `/series/${item.tmdb_id}`
                                )
                            }
                        >
                            <div className="rounded-xl overflow-hidden border border-border bg-card shadow-lg">
                                <img
                                    src={
                                        item.poster_path
                                            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                                            : "/placeholder_poster.png"
                                    }
                                    className="w-full h-[330px] object-cover group-hover:scale-105 transition"
                                />
                            </div>
                            <h3 className="mt-2 font-semibold truncate group-hover:text-accent">
                                {item.title}
                            </h3>
                            <p className="text-muted-foreground text-sm capitalize">
                                {item.media_type}
                            </p>
                        </div>
                    ))}
                </div>

                {/* RIGHT ARROW */}
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20
                     bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </section>
    );
}
