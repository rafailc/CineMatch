import { useEffect, useMemo, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function StoryViewer({
                                        usersStories = [], // array of arrays: [[story, story], [story], ...]
                                        startUserIndex = 0,
                                        startStoryIndex = 0,
                                        onClose,
                                    }) {
    // keep a local copy so deletes update instantly
    const [localUsersStories, setLocalUsersStories] = useState(usersStories);

    const [userIndex, setUserIndex] = useState(startUserIndex);
    const [storyIndex, setStoryIndex] = useState(startStoryIndex);

    const [meId, setMeId] = useState(null);

    const [menuOpen, setMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setMeId(data?.user?.id || null);
        });
    }, []);

    // when parent payload changes, refresh local copy + indices
    useEffect(() => {
        setLocalUsersStories(usersStories);
        setUserIndex(startUserIndex);
        setStoryIndex(startStoryIndex);
    }, [usersStories, startUserIndex, startStoryIndex]);

    const currentUserStories = localUsersStories?.[userIndex] || [];
    const currentStory = currentUserStories?.[storyIndex];

    const totalUsers = localUsersStories.length;

    const header = useMemo(() => {
        const first = currentUserStories?.[0];
        return {
            username: first?.profiles?.username || "Unknown",
            avatar: first?.profiles?.avatar_url || "https://via.placeholder.com/40",
        };
    }, [currentUserStories]);

    const atFirst = userIndex === 0 && storyIndex === 0;
    const atLast =
        totalUsers === 0
            ? true
            : userIndex === totalUsers - 1 &&
            storyIndex === (currentUserStories.length || 1) - 1;

    const isMine = !!currentStory && !!meId && currentStory.user_id === meId;

    const goNext = useCallback(() => {
        setMenuOpen(false);

        if (storyIndex < currentUserStories.length - 1) {
            setStoryIndex((i) => i + 1);
            return;
        }
        if (userIndex < totalUsers - 1) {
            setUserIndex((u) => u + 1);
            setStoryIndex(0);
            return;
        }
        onClose?.();
    }, [storyIndex, currentUserStories.length, userIndex, totalUsers, onClose]);

    const goPrev = useCallback(() => {
        setMenuOpen(false);

        if (storyIndex > 0) {
            setStoryIndex((i) => i - 1);
            return;
        }
        if (userIndex > 0) {
            const prevUserIndex = userIndex - 1;
            const prevStories = localUsersStories?.[prevUserIndex] || [];
            setUserIndex(prevUserIndex);
            setStoryIndex(Math.max(prevStories.length - 1, 0));
            return;
        }
        onClose?.();
    }, [storyIndex, userIndex, localUsersStories, onClose]);

    // Auto advance (like IG)
    useEffect(() => {
        if (!currentStory) return;

        const timer = setTimeout(() => {
            goNext();
        }, 5000);

        return () => clearTimeout(timer);
    }, [currentStory?.id, goNext]);

    // if story disappears (after delete), close safely
    useEffect(() => {
        if (!currentStory && localUsersStories.length === 0) onClose?.();
    }, [currentStory, localUsersStories.length, onClose]);

    async function handleDeleteStory() {
        if (!currentStory || !isMine) return;

        const ok = window.confirm("Delete this story?");
        if (!ok) return;

        setIsDeleting(true);
        try {
            const { error } = await supabase.from("stories").delete().eq("id", currentStory.id);
            if (error) throw error;

            // remove from local UI
            setLocalUsersStories((prev) => {
                const next = prev.map((arr, idx) => {
                    if (idx !== userIndex) return arr;
                    return arr.filter((s) => s.id !== currentStory.id);
                });

                // remove empty users
                const cleaned = next.filter((arr) => arr.length > 0);

                // adjust indices
                // if the current user's array became empty, keep same userIndex if possible, else go back
                const sameUserExists = cleaned[userIndex]?.length > 0;

                if (!sameUserExists) {
                    if (userIndex >= cleaned.length) {
                        setUserIndex(Math.max(cleaned.length - 1, 0));
                        setStoryIndex(0);
                    } else {
                        setStoryIndex(0);
                    }
                } else {
                    setStoryIndex((i) => Math.min(i, cleaned[userIndex].length - 1));
                }

                if (cleaned.length === 0) onClose?.();

                return cleaned;
            });

            setMenuOpen(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setIsDeleting(false);
        }
    }

    if (!currentStory) return null;

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            {/* Tap zones */}
            <button
                className="absolute left-0 top-0 h-full w-1/2 cursor-pointer"
                onClick={goPrev}
                aria-label="Previous story"
            />
            <button
                className="absolute right-0 top-0 h-full w-1/2 cursor-pointer"
                onClick={goNext}
                aria-label="Next story"
            />

            {/* Top header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                    <img
                        src={header.avatar}
                        alt={header.username}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-white font-semibold text-sm">{header.username}</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* ✅ 3 dots + delete */}
                    {isMine && (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpen((v) => !v);
                                }}
                                className="text-white p-2 bg-white/10 rounded-full hover:bg-white/20"
                                aria-label="Story menu"
                            >
                                <MoreHorizontal />
                            </button>

                            {menuOpen && (
                                <>
                                    {/* click outside */}
                                    <button
                                        onClick={() => setMenuOpen(false)}
                                        className="fixed inset-0 z-30 cursor-default"
                                    />
                                    <div className="absolute right-0 mt-2 z-40 w-44 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                                        <button
                                            disabled={isDeleting}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteStory();
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 text-red-400 disabled:opacity-50"
                                        >
                                            {isDeleting ? "Deleting..." : "Delete story"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose?.();
                        }}
                        className="text-white p-2 bg-white/10 rounded-full hover:bg-white/20"
                        aria-label="Close"
                    >
                        <X />
                    </button>
                </div>
            </div>

            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 px-4 pt-2 z-20">
                <div className="flex gap-1">
                    {currentUserStories.map((_, i) => (
                        <div key={i} className="flex-1 h-1 bg-white/30 rounded overflow-hidden">
                            <div className={`h-full bg-white ${i <= storyIndex ? "w-full" : "w-0"}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Arrows */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                }}
                disabled={atFirst}
                className={`absolute left-4 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition ${
                    atFirst ? "opacity-30 cursor-not-allowed" : ""
                }`}
                aria-label="Previous"
            >
                <ChevronLeft size={28} />
            </button>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                }}
                disabled={atLast}
                className={`absolute right-4 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition ${
                    atLast ? "opacity-30 cursor-not-allowed" : ""
                }`}
                aria-label="Next"
            >
                <ChevronRight size={28} />
            </button>

            {/* Story media */}
            <img
                src={currentStory.media_url}
                className="max-h-full max-w-full object-contain"
                alt="Story"
                draggable={false}
            />
        </div>
    );
}