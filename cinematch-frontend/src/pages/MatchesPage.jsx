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
 */import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MatchesPage() {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);

    useEffect(() => {
        loadMatches();
    }, []);

    async function loadMatches() {
        setLoading(true);

        const { data: auth } = await supabase.auth.getUser();
        const me = auth?.user;
        if (!me) {
            toast.error("You must be logged in.");
            setLoading(false);
            return;
        }

        const { data: matches, error: mErr } = await supabase
            .from("user_matches")
            .select("id, matched_user_id, similarity, shared_genres, created_at")
            .eq("user_id", me.id)
            .order("created_at", { ascending: false });

        if (mErr) {
            console.error(mErr);
            toast.error("Failed to load matches");
            setLoading(false);
            return;
        }

        if (!matches?.length) {
            setRows([]);
            setLoading(false);
            return;
        }

        const ids = matches.map(m => m.matched_user_id);

        const { data: profs, error: pErr } = await supabase
            .from("profiles")
            .select("id, username, avatar_url, email")
            .in("id", ids);

        if (pErr) {
            console.error(pErr);
            toast.error("Failed to load matched profiles");
            setLoading(false);
            return;
        }

        const byId = new Map((profs || []).map(p => [p.id, p]));

        setRows(
            matches.map(m => ({
                match: m,
                profile: byId.get(m.matched_user_id) || null,
            }))
        );

        setLoading(false);
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 px-6 pb-20">
            <h1 className="text-4xl font-bold mb-8">Matches</h1>

            {rows.length === 0 ? (
                <p className="text-muted-foreground">
                    No matches yet. Go to Tinder and accept some people.
                </p>
            ) : (
                <div className="grid gap-4 max-w-2xl">
                    {rows.map(({ match, profile }) => (
                        <div
                            key={match.id}
                            className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4"
                        >
                            <div className="w-14 h-14 rounded-full overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center">
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xl">👤</span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="text-lg font-semibold truncate">
                                    {profile?.username || profile?.email || "Unknown user"}
                                </div>

                                {match.shared_title ? (
                                    <div className="text-sm text-muted-foreground">
                                        You both liked:{" "}
                                        <span className="text-foreground font-medium">
                      {match.shared_title}
                    </span>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">
                                        Taste match
                                    </div>
                                )}
                            </div>

                            {/* (Optional) later: open chat */}
                            <button
                                disabled
                                className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-muted-foreground cursor-not-allowed"
                            >
                                Chat
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
