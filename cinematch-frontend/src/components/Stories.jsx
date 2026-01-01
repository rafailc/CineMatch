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
 */import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { PlusCircle } from "lucide-react";

export default function Stories({ onAddStory, onOpenStories, refreshKey = 0 }) {
    const [stories, setStories] = useState([]);
    const [meId, setMeId] = useState(null);
    const [meProfile, setMeProfile] = useState(null);

    useEffect(() => {
        loadStories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]);

    async function loadStories() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        setMeId(user?.id || null);

        // ✅ get my profile even if I have no stories
        if (user?.id) {
            const { data: prof, error: profErr } = await supabase
                .from("profiles")
                .select("username, avatar_url")
                .eq("id", user.id)
                .single();

            if (!profErr) setMeProfile(prof);
        }

        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from("stories")
            .select(
                `
          id,
          media_url,
          user_id,
          created_at,
          profiles ( username, avatar_url )
        `
            )
            .gte("created_at", since)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Stories error:", error);
            setStories([]);
            return;
        }

        setStories(data || []);
    }

    // group by user_id
    const grouped = useMemo(() => {
        const map = {};
        for (const s of stories || []) {
            if (!map[s.user_id]) map[s.user_id] = [];
            map[s.user_id].push(s);
        }
        return map;
    }, [stories]);

    const userBuckets = useMemo(() => {
        const arr = Object.values(grouped).map((userStories) => {
            const first = userStories[0];
            return {
                user_id: first.user_id,
                username: first.profiles?.username || "Unknown",
                avatar_url: first.profiles?.avatar_url || "https://via.placeholder.com/150",
                latest_at: first.created_at,
                stories: userStories,
            };
        });

        arr.sort((a, b) => new Date(b.latest_at) - new Date(a.latest_at));
        return arr;
    }, [grouped]);

    const orderedBuckets = useMemo(() => {
        if (!meId) return userBuckets;

        const mineIndex = userBuckets.findIndex((b) => b.user_id === meId);
        if (mineIndex === -1) return userBuckets;

        const mine = userBuckets[mineIndex];
        const rest = userBuckets.filter((_, i) => i !== mineIndex);
        return [mine, ...rest];
    }, [userBuckets, meId]);

    const usersStories = useMemo(() => orderedBuckets.map((b) => b.stories), [orderedBuckets]);

    const myBucket = useMemo(() => {
        if (!meId) return null;
        return orderedBuckets.find((b) => b.user_id === meId) || null;
    }, [orderedBuckets, meId]);

    // ✅ now it's safe to compute
    const myAvatar =
        meProfile?.avatar_url ||
        myBucket?.avatar_url ||
        "https://via.placeholder.com/150";

    const myName = meProfile?.username || "Your Story";

    const openViewerAtUserIndex = (startUserIndex) => {
        if (!usersStories.length) return;
        onOpenStories?.({
            usersStories,
            startUserIndex,
            startStoryIndex: 0,
        });
    };

    return (
        <section className="mb-6 px-4 md:px-0">
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
                {/* MY STORY */}
                <div className="flex flex-col items-center gap-1 min-w-[70px]">
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                            if (myBucket?.stories?.length) openViewerAtUserIndex(0);
                            else onAddStory?.();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                if (myBucket?.stories?.length) openViewerAtUserIndex(0);
                                else onAddStory?.();
                            }
                        }}
                        className="relative group cursor-pointer"
                    >
                        <div
                            className={`p-[3px] rounded-full ${
                                myBucket?.stories?.length
                                    ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"
                                    : "bg-white/10"
                            }`}
                        >
                            <div className="p-[2px] bg-background rounded-full">
                                <img
                                    src={myAvatar}
                                    alt={myName}
                                    className="w-16 h-16 rounded-full object-cover group-hover:scale-95 transition-transform duration-200"
                                />
                            </div>
                        </div>

                        {/* + button ALWAYS */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddStory?.();
                            }}
                            className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-0.5 border-2 border-background hover:scale-105 transition"
                            aria-label="Add story"
                            title="Add story"
                        >
                            <PlusCircle size={16} />
                        </button>
                    </div>

                    <span className="text-xs text-muted-foreground truncate w-full text-center">
    {myName}
  </span>
                </div>


                {/* OTHER USERS */}
                {orderedBuckets.map((bucket, idx) => {
                    if (bucket.user_id === meId) return null;

                    return (
                        <button
                            key={bucket.user_id}
                            onClick={() => openViewerAtUserIndex(idx)}
                            className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group"
                        >
                            <div className="p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                                <div className="p-[2px] bg-background rounded-full">
                                    <img
                                        src={bucket.avatar_url || "https://via.placeholder.com/150"}
                                        alt={bucket.username}
                                        className="w-16 h-16 rounded-full object-cover group-hover:scale-95 transition-transform duration-200"
                                    />
                                </div>
                            </div>

                            <span className="text-xs text-muted-foreground truncate w-full text-center">
                {bucket.username}
              </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}