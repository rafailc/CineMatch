import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import PreferencesModal from "@/components/PreferencesModal";

/* ------------------ similarity helpers ------------------ */
function toVector(affinityArray) {
    const v = {};
    for (const x of affinityArray || []) {
        if (!x?.genre) continue;
        v[x.genre] = (x.percentage || 0) / 100;
    }
    return v;
}

function cosineSimilarity(a, b) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    let dot = 0,
        na = 0,
        nb = 0;

    for (const k of keys) {
        const av = a[k] || 0;
        const bv = b[k] || 0;
        dot += av * bv;
        na += av * av;
        nb += bv * bv;
    }
    if (na === 0 || nb === 0) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function topSharedGenres(my, other, n = 3) {
    const keys = new Set([...Object.keys(my), ...Object.keys(other)]);
    const shared = [];

    for (const k of keys) {
        const overlap = Math.min(my[k] || 0, other[k] || 0);
        if (overlap > 0) shared.push({ genre: k, overlap });
    }

    shared.sort((x, y) => y.overlap - x.overlap);
    return shared.slice(0, n).map((x) => x.genre);
}

/* ------------------ conversation helper ------------------ */
async function ensureConversation(userA, userB) {
    const [user1, user2] = userA < userB ? [userA, userB] : [userB, userA];

    // Try insert
    const { data: inserted, error: insErr } = await supabase
        .from("conversations")
        .insert({ user1_id: user1, user2_id: user2 })
        .select("id")
        .maybeSingle();

    if (!insErr && inserted?.id) return inserted.id;

    // If already exists, fetch
    const { data: existing, error: selErr } = await supabase
        .from("conversations")
        .select("id")
        .eq("user1_id", user1)
        .eq("user2_id", user2)
        .maybeSingle();

    if (selErr) throw selErr;
    return existing?.id ?? null;
}

/* ------------------ Photo carousel for Tinder cards ------------------ */
function PhotoCarousel({ photos }) {
    const [i, setI] = useState(0);
    const has = Array.isArray(photos) && photos.length > 0;

    useEffect(() => {
        setI(0);
    }, [photos?.length]);

    if (!has) {
        return (
            <div className="mt-4 h-[320px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
                No photos
            </div>
        );
    }

    const prev = () => setI((x) => (x - 1 + photos.length) % photos.length);
    const next = () => setI((x) => (x + 1) % photos.length);

    return (
        <div className="mt-4">
            <div className="relative h-[320px] rounded-xl overflow-hidden border border-border bg-black/20">
                <img
                    src={photos[i]}
                    alt={`photo ${i + 1}`}
                    className="w-full h-full object-cover object-top"
                />

                {photos.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-xl bg-black/40 text-white hover:bg-black/60"
                        >
                            ‹
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-xl bg-black/40 text-white hover:bg-black/60"
                        >
                            ›
                        </button>
                    </>
                )}
            </div>

            {photos.length > 1 && (
                <div className="flex justify-center gap-1 mt-2">
                    {photos.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 w-6 rounded-full ${
                                idx === i ? "bg-white/60" : "bg-white/20"
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ------------------ Tinder Profile editor INSIDE page ------------------ */
function MyTinderProfile({ open }) {
    const [loading, setLoading] = useState(true);
    const [me, setMe] = useState(null);
    const [photos, setPhotos] = useState([]);

    useEffect(() => {
        if (open) init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    async function init() {
        setLoading(true);

        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        setMe(user || null);

        if (!user) {
            setPhotos([]);
            setLoading(false);
            return;
        }

        await loadMyPhotos(user.id);
        setLoading(false);
    }

    async function loadMyPhotos(userId) {
        const { data, error } = await supabase
            .from("profile_photos")
            .select("id, url, sort_order, created_at")
            .eq("user_id", userId)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true });

        if (error) {
            console.error(error);
            toast.error("Failed to load your photos");
            setPhotos([]);
            return;
        }
        setPhotos(data || []);
    }

    async function upload(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!me) {
            toast.error("You must be logged in.");
            return;
        }

        try {
            const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
            const safeId =
                (crypto?.randomUUID && crypto.randomUUID()) ||
                `${Date.now()}-${Math.random().toString(16).slice(2)}`;

            const path = `${me.id}/${safeId}.${ext}`;

            const { error: upErr } = await supabase.storage
                .from("profile-photos")
                .upload(path, file, {
                    upsert: false,
                    contentType: file.type,
                });

            if (upErr) {
                console.error("UPLOAD ERROR:", upErr);
                toast.error(`Upload failed: ${upErr.message}`);
                return;
            }

            const { data: pub } = supabase.storage.from("profile-photos").getPublicUrl(path);
            const url = pub?.publicUrl;
            if (!url) {
                toast.error("Upload succeeded but URL missing");
                return;
            }

            const nextOrder = photos.length
                ? Math.max(...photos.map((p) => p.sort_order ?? 0)) + 1
                : 0;

            const { error: dbErr } = await supabase.from("profile_photos").insert({
                user_id: me.id,
                url,
                sort_order: nextOrder,
            });

            if (dbErr) {
                console.error("DB ERROR:", dbErr);
                toast.error(`DB insert failed: ${dbErr.message}`);
                return;
            }

            toast.success("Photo uploaded!");
            await loadMyPhotos(me.id);
            e.target.value = "";
        } catch (err) {
            console.error("UPLOAD CRASH:", err);
            toast.error(`Upload crashed: ${err?.message || "unknown error"}`);
        }
    }

    async function removePhoto(photoId, url) {
        const ok = confirm("Delete this photo?");
        if (!ok) return;

        try {
            const marker = "/profile-photos/";
            const idx = url.indexOf(marker);
            if (idx !== -1) {
                const path = url.slice(idx + marker.length);
                await supabase.storage.from("profile-photos").remove([path]);
            }
        } catch (e) {
            console.warn("Storage delete failed:", e);
        }

        const { error } = await supabase.from("profile_photos").delete().eq("id", photoId);
        if (error) {
            console.error(error);
            toast.error("Failed to delete photo");
            return;
        }

        toast.success("Photo deleted");
        if (me?.id) await loadMyPhotos(me.id);
    }

    if (!open) return null;

    return (
        <div className="max-w-md mx-auto mt-6 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">My Tinder Profile</h2>
                <label className="px-3 py-2 rounded-xl bg-primary text-white hover:bg-primary/80 cursor-pointer">
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={upload} />
                </label>
            </div>

            <p className="text-sm text-muted-foreground mt-2">
                Upload a few photos (3–6). They will show on your Tinder card.
            </p>

            {loading ? (
                <div className="mt-4 text-muted-foreground">Loading...</div>
            ) : photos.length === 0 ? (
                <div className="mt-4 text-muted-foreground">No photos yet.</div>
            ) : (
                <div className="mt-4 grid grid-cols-2 gap-3">
                    {photos.map((p) => (
                        <div key={p.id} className="rounded-xl overflow-hidden border border-border bg-background">
                            <img src={p.url} alt="profile" className="w-full h-40 object-cover" />
                            <button
                                onClick={() => removePhoto(p.id, p.url)}
                                className="w-full py-2 text-sm bg-white/5 hover:bg-white/10 transition"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ------------------ Matches section ------------------ */
function MatchesSection({ matches, matchesLoading, onRefresh }) {
    return (
        <div className="max-w-md mx-auto mt-8">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Matches</h2>
                <button
                    onClick={onRefresh}
                    className="text-sm px-3 py-1 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15 transition"
                >
                    Refresh
                </button>
            </div>

            {matchesLoading ? (
                <div className="text-muted-foreground">Loading matches...</div>
            ) : matches.length === 0 ? (
                <div className="text-muted-foreground">No matches yet.</div>
            ) : (
                <div className="grid gap-3">
                    {matches.slice(0, 12).map(({ match, profile }) => (
                        <div
                            key={match.id}
                            className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"
                        >
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <span>👤</span>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="font-semibold truncate">
                                    {profile?.username || profile?.email || "Unknown"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Match: {Math.round(match.similarity ?? 0)}%
                                    {Array.isArray(match.shared_genres) && match.shared_genres.length > 0
                                        ? ` · Κοινά: ${match.shared_genres.slice(0, 3).join(", ")}`
                                        : ""}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (match.conversation_id) {
                                        window.location.href = `/chat/${match.conversation_id}`;
                                    }
                                }}
                                disabled={!match.conversation_id}
                                className={`px-3 py-2 rounded-lg border transition ${
                                    match.conversation_id
                                        ? "bg-white/10 border-white/10 hover:bg-white/15"
                                        : "bg-white/5 border-white/5 text-muted-foreground cursor-not-allowed"
                                }`}
                            >
                                Message
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ------------------ Tinder Page ------------------ */
export default function CineBuds() {
    const [loading, setLoading] = useState(true);
    const [cards, setCards] = useState([]);
    const [idx, setIdx] = useState(0);

    const [showMatches, setShowMatches] = useState(true);
    const [matchesLoading, setMatchesLoading] = useState(false);
    const [matches, setMatches] = useState([]);

    const [showMyProfile, setShowMyProfile] = useState(false);

    // preference gate
    const [user, setUser] = useState(null);
    const [prefModalOpen, setPrefModalOpen] = useState(false);

    const current = useMemo(() => cards[idx], [cards, idx]);

    // ✅ Gate Tinder: open preferences if no genres selected
    useEffect(() => {
        initGate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function initGate() {
        setLoading(true);

        const { data: auth } = await supabase.auth.getUser();
        const me = auth?.user;

        if (!me) {
            toast.error("You must be logged in.");
            setLoading(false);
            return;
        }

        setUser(me);

        // check explicit genres selection
        const { data: prefRow, error } = await supabase
            .from("user_preferences")
            .select("genres")
            .eq("user_id", me.id)
            .maybeSingle();

        if (error) console.error(error);

        const selected = prefRow?.genres || [];

        if (!selected.length) {
            // force modal
            setPrefModalOpen(true);
            setLoading(false);
            return;
        }

        // else load normal tinder
        await Promise.all([loadDeck(), loadMatches()]);
        setLoading(false);
    }

    async function loadMatches() {
        setMatchesLoading(true);

        const { data: auth } = await supabase.auth.getUser();
        const me = auth?.user;
        if (!me) {
            setMatches([]);
            setMatchesLoading(false);
            return;
        }

        const { data: mRows, error: mErr } = await supabase
            .from("user_matches")
            .select("id, matched_user_id, similarity, shared_genres, conversation_id, created_at")
            .eq("user_id", me.id)
            .order("created_at", { ascending: false });

        if (mErr) {
            console.error(mErr);
            setMatches([]);
            setMatchesLoading(false);
            return;
        }

        if (!mRows?.length) {
            setMatches([]);
            setMatchesLoading(false);
            return;
        }

        const ids = mRows.map((r) => r.matched_user_id);

        const { data: profs, error: pErr } = await supabase
            .from("profiles")
            .select("id, username, avatar_url, email")
            .in("id", ids);

        if (pErr) {
            console.error(pErr);
            setMatches([]);
            setMatchesLoading(false);
            return;
        }

        const byId = new Map((profs || []).map((p) => [p.id, p]));

        setMatches(
            mRows.map((m) => ({
                match: m,
                profile: byId.get(m.matched_user_id) || null,
            }))
        );

        setMatchesLoading(false);
    }

    async function loadDeck() {
        const { data: auth } = await supabase.auth.getUser();
        const me = auth?.user;
        if (!me) {
            toast.error("You must be logged in.");
            setCards([]);
            setIdx(0);
            return;
        }

        const { data: myPref, error: myErr } = await supabase
            .from("user_preferences")
            .select("genre_affinity")
            .eq("user_id", me.id)
            .maybeSingle();

        if (myErr) {
            console.error(myErr);
            toast.error("Failed to load your taste profile");
            setCards([]);
            setIdx(0);
            return;
        }

        const myAffinity = myPref?.genre_affinity || [];
        if (!myAffinity.length) {
            setCards([]);
            setIdx(0);
            return;
        }

        const myVec = toVector(myAffinity);

        const { data: swipes } = await supabase
            .from("user_tinder_swipes")
            .select("target_user_id")
            .eq("swiper_id", me.id);

        const excluded = new Set((swipes || []).map((s) => s.target_user_id));

        const { data: others, error: oErr } = await supabase
            .from("user_preferences")
            .select("user_id, genre_affinity")
            .neq("user_id", me.id);

        if (oErr) {
            console.error(oErr);
            toast.error("Failed to load other users");
            setCards([]);
            setIdx(0);
            return;
        }

        const candidateIds = (others || [])
            .map((r) => r.user_id)
            .filter((uid) => !excluded.has(uid));

        if (!candidateIds.length) {
            setCards([]);
            setIdx(0);
            return;
        }

        const { data: profs, error: pErr } = await supabase
            .from("profiles")
            .select("id, username, avatar_url, email")
            .in("id", candidateIds);

        if (pErr) {
            console.error(pErr);
            toast.error("Failed to load profiles");
            setCards([]);
            setIdx(0);
            return;
        }

        const { data: photosRows, error: phErr } = await supabase
            .from("profile_photos")
            .select("user_id, url, sort_order")
            .in("user_id", candidateIds)
            .order("sort_order", { ascending: true });

        if (phErr) console.error(phErr);

        const photosByUser = new Map();
        for (const r of photosRows || []) {
            if (!photosByUser.has(r.user_id)) photosByUser.set(r.user_id, []);
            photosByUser.get(r.user_id).push(r.url);
        }

        const prefById = new Map((others || []).map((r) => [r.user_id, r.genre_affinity || []]));
        const profById = new Map((profs || []).map((p) => [p.id, p]));

        const built = candidateIds
            .map((uid) => {
                const prof = profById.get(uid);
                const aff = prefById.get(uid) || [];
                if (!prof || !aff.length) return null;

                const vec = toVector(aff);
                const sim = cosineSimilarity(myVec, vec);
                const shared = topSharedGenres(myVec, vec, 3);

                return {
                    profile: prof,
                    similarity: sim,
                    sharedGenres: shared,
                    photos: photosByUser.get(uid) || [],
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 50);

        setCards(built);
        setIdx(0);
    }

    async function decide(action) {
        const { data: auth } = await supabase.auth.getUser();
        const me = auth?.user;
        if (!me || !current) return;

        const targetId = current.profile.id;
        const similarityPct = Math.round(current.similarity * 1000) / 10;

        const { error: swipeErr } = await supabase
            .from("user_tinder_swipes")
            .upsert(
                {
                    swiper_id: me.id,
                    target_user_id: targetId,
                    action,
                    similarity: similarityPct,
                    shared_genres: current.sharedGenres,
                },
                { onConflict: "swiper_id,target_user_id" }
            );

        if (swipeErr) {
            console.error(swipeErr);
            toast.error("Failed to save decision");
            return;
        }

        if (action === "accept") {
            let convId = null;
            try {
                convId = await ensureConversation(me.id, targetId);
            } catch (e) {
                console.error("ensureConversation failed:", e);
            }

            const { error: matchErr1 } = await supabase
                .from("user_matches")
                .upsert(
                    {
                        user_id: me.id,
                        matched_user_id: targetId,
                        similarity: similarityPct,
                        shared_genres: current.sharedGenres,
                        conversation_id: convId,
                    },
                    { onConflict: "user_id,matched_user_id" }
                );

            const { error: matchErr2 } = await supabase
                .from("user_matches")
                .upsert(
                    {
                        user_id: targetId,
                        matched_user_id: me.id,
                        similarity: similarityPct,
                        shared_genres: current.sharedGenres,
                        conversation_id: convId,
                    },
                    { onConflict: "user_id,matched_user_id" }
                );

            if (matchErr1 || matchErr2) {
                console.error(matchErr1 || matchErr2);
                toast.error("Saved swipe, but failed to add match");
            } else {
                toast.success(`Match saved! Κοινά: ${current.sharedGenres.join(", ")}`);
                loadMatches().catch(console.error);
            }
        }

        setIdx((i) => i + 1);
    }

    const header = (
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">CineBuds</h1>

            <div className="flex gap-2">
                <button
                    onClick={() => setShowMyProfile((v) => !v)}
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition"
                >
                    {showMyProfile ? "Hide Profile" : "My Profile"}
                </button>

                <button
                    onClick={() => setShowMatches((v) => !v)}
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition"
                >
                    {showMatches ? "Hide Matches" : "Matches"}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 px-6 pb-20">
            {/* ✅ Preferences modal gate */}
            <PreferencesModal
                open={prefModalOpen}
                user={user}
                onClose={async () => {
                    setPrefModalOpen(false);
                    // after saving, load tinder
                    setLoading(true);
                    await Promise.all([loadDeck(), loadMatches()]);
                    setLoading(false);
                }}
            />

            {header}

            {/* If modal is open (no prefs), stop user here */}
            {prefModalOpen ? (
                <p className="text-muted-foreground">
                    Πρέπει να διαλέξεις τουλάχιστον 1 genre για να χρησιμοποιήσεις Tinder.
                </p>
            ) : loading ? (
                <div className="min-h-[50vh] flex items-center justify-center">
                    <div className="text-muted-foreground">Loading...</div>
                </div>
            ) : !cards.length ? (
                <>
                    <p className="text-muted-foreground">
                        Not enough data yet. Choose genres or add favorites to build your taste profile.
                    </p>

                    <MyTinderProfile open={showMyProfile} />

                    {showMatches && (
                        <MatchesSection
                            matches={matches}
                            matchesLoading={matchesLoading}
                            onRefresh={loadMatches}
                        />
                    )}
                </>
            ) : !current ? (
                <>
                    <p className="text-muted-foreground">End of deck.</p>

                    <MyTinderProfile open={showMyProfile} />

                    {showMatches && (
                        <MatchesSection
                            matches={matches}
                            matchesLoading={matchesLoading}
                            onRefresh={loadMatches}
                        />
                    )}
                </>
            ) : (
                <>
                    <MyTinderProfile open={showMyProfile} />

                    <div className="max-w-md mx-auto rounded-2xl border border-border bg-card p-6 shadow-lg mt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 border border-white/10">
                                {current.profile.avatar_url ? (
                                    <img
                                        src={current.profile.avatar_url}
                                        className="w-full h-full object-cover"
                                        alt=""
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl">
                                        👤
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <div className="text-xl font-semibold truncate">
                                    {current.profile.username || current.profile.email}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Match:{" "}
                                    <span className="text-foreground font-medium">
                    {Math.round(current.similarity * 100)}%
                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Κοινά genres:{" "}
                                    <span className="text-foreground font-medium">
                    {current.sharedGenres.join(", ")}
                  </span>
                                </div>
                            </div>
                        </div>

                        <PhotoCarousel photos={current.photos} />

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => decide("reject")}
                                className="flex-1 py-3 rounded-xl border border-border bg-background hover:bg-white/5 transition"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => decide("accept")}
                                className="flex-1 py-3 rounded-xl bg-primary text-white hover:bg-primary/80 transition"
                            >
                                Accept
                            </button>
                        </div>

                        <div className="mt-3 text-center text-xs text-muted-foreground">
                            Card {idx + 1} / {cards.length}
                        </div>
                    </div>

                    {showMatches && (
                        <MatchesSection
                            matches={matches}
                            matchesLoading={matchesLoading}
                            onRefresh={loadMatches}
                        />
                    )}
                </>
            )}
        </div>
    );
}
