import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// Your backend controllers:
const NEW_HOT_BASE = "http://localhost:8080/api/newhot";
const NEWS_BASE = "http://localhost:8080/api/news";

function MediaCard({ item, kind }) {
    const title = kind === "tv" ? item?.name : item?.title;
    const poster = item?.poster_path;
    const vote = item?.vote_average ?? 0;

    const to = kind === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;

    return (
        <Link to={to} className="block">
            <div className="group rounded-2xl overflow-hidden bg-secondary/20 border border-border hover:bg-secondary/30 transition">
                <div className="aspect-[2/3] bg-black/20 overflow-hidden">
                    {poster ? (
                        <img
                            src={`${IMG_BASE}${poster}`}
                            alt={title || "Poster"}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                            No poster
                        </div>
                    )}
                </div>

                <div className="p-3">
                    <div className="font-semibold text-foreground line-clamp-2">
                        {title || "—"}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                        ⭐ {Number(vote).toFixed(1)}
                    </div>
                </div>
            </div>
        </Link>
    );
}

function Row({ title, items, kind }) {
    return (
        <div className="mt-10">
            <div className="flex items-end justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
            </div>

            {(items || []).length === 0 ? (
                <div className="mt-4 text-sm text-muted-foreground">No items found.</div>
            ) : (
                <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
                    {(items || []).slice(0, 12).map((m) => (
                        <div
                            key={m.id}
                            className="min-w-[140px] w-[140px] sm:min-w-[160px] sm:w-[160px]"
                        >
                            <MediaCard item={m} kind={kind} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function NewsList({ items }) {
    return (
        <div className="mt-10">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Movie & TV News
            </h2>

            {(items || []).length === 0 ? (
                <div className="mt-4 text-sm text-muted-foreground">No news found.</div>
            ) : (
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                    {(items || []).slice(0, 12).map((n, idx) => (
                        <a
                            key={idx}
                            href={n.link}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-2xl border border-border bg-secondary/20 hover:bg-secondary/30 transition p-4"
                        >
                            <div className="text-sm text-muted-foreground">{n.source || "News"}</div>
                            <div className="mt-1 font-bold text-foreground leading-snug">
                                {n.title || "—"}
                            </div>

                            {n.publishedAt && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                    {new Date(n.publishedAt).toLocaleString()}
                                </div>
                            )}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

// read text first; if backend returns HTML, show it in error
async function fetchJson(url) {
    const res = await fetch(url);
    const text = await res.text();

    if (!res.ok) {
        throw new Error(
            `HTTP ${res.status} ${res.statusText}\n${url}\n` +
            `First 200 chars:\n${text.slice(0, 200)}`
        );
    }

    try {
        return JSON.parse(text);
    } catch {
        throw new Error(
            `Not JSON from:\n${url}\nFirst 200 chars:\n${text.slice(0, 200)}`
        );
    }
}

export default function NewHot() {
    const [nowPlaying, setNowPlaying] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [onTheAir, setOnTheAir] = useState([]);
    const [news, setNews] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancel = false;

        (async () => {
            try {
                setLoading(true);
                setError("");

                const [a, b, c, d] = await Promise.all([
                    fetchJson(`${NEW_HOT_BASE}/movies/now-playing?page=1`),
                    fetchJson(`${NEW_HOT_BASE}/movies/upcoming?region=GR&page=1`),
                    fetchJson(`${NEW_HOT_BASE}/tv/on-the-air?page=1`),
                    fetchJson(`${NEWS_BASE}?limit=25`),
                ]);

                if (cancel) return;

                setNowPlaying(a?.results || []);
                setUpcoming(b?.results || []);
                setOnTheAir(c?.results || []);
                setNews(Array.isArray(d) ? d : []);
            } catch (e) {
                if (!cancel) {
                    console.error(e);
                    setError(e?.message || "Failed to load New & Hot");
                }
            } finally {
                if (!cancel) setLoading(false);
            }
        })();

        return () => {
            cancel = true;
        };
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <section className="container mx-auto px-4 pt-24 pb-16">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold">
                        <span className="text-foreground">New</span>
                        <span className="text-red-500">&amp;</span>
                        <span className="text-foreground">Hot</span>
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Fresh releases, upcoming hits, trending TV — plus the latest entertainment news.
                    </p>
                </div>

                {loading ? (
                    <div className="mt-10 text-center text-muted-foreground">Loading…</div>
                ) : error ? (
                    <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 whitespace-pre-wrap">
                        {error}
                    </div>
                ) : (
                    <>
                        <Row title="Now Playing Movies" items={nowPlaying} kind="movie" />
                        <Row title="Upcoming Movies" items={upcoming} kind="movie" />
                        <Row title="On The Air Series" items={onTheAir} kind="tv" />
                        <NewsList items={news} />
                    </>
                )}
            </section>
        </div>
    );
}