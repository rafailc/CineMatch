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
import { X, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Comments({ postId, open, onClose, onCountChange }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [meId, setMeId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Build a map { userId -> profile }
    const profilesById = useMemo(() => {
        const map = {};
        for (const c of comments) {
            if (c.profile && c.user_id) map[c.user_id] = c.profile;
        }
        return map;
    }, [comments]);

    useEffect(() => {
        if (!open) return;
        (async () => {
            const { data } = await supabase.auth.getUser();
            setMeId(data?.user?.id ?? null);
        })();
    }, [open]);

    useEffect(() => {
        if (open) fetchComments();
        // also refetch if postId changes while modal open
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, postId]);

    async function fetchComments() {
        if (!postId) return;
        setLoading(true);

        // 1) fetch comments WITHOUT join (works even if no FK exists)
        const { data: commentRows, error: cErr } = await supabase
            .from("media_comments")
            .select("id, post_id, user_id, comment_text, created_at")
            .eq("post_id", postId)
            .order("created_at", { ascending: true });

        if (cErr) {
            // don’t spam logs in prod; you can remove this line later
            console.error("fetchComments error:", cErr);
            setComments([]);
            onCountChange?.(0);
            setLoading(false);
            return;
        }

        const rows = commentRows || [];
        onCountChange?.(rows.length);

        // 2) fetch profiles for those users
        const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];

        let profileMap = {};
        if (userIds.length > 0) {
            const { data: profRows, error: pErr } = await supabase
                .from("profiles")
                .select("id, username, avatar_url")
                .in("id", userIds);

            if (pErr) {
                console.error("profiles fetch error:", pErr);
            } else {
                for (const p of profRows || []) profileMap[p.id] = p;
            }
        }

        // merge profile into each comment row
        const merged = rows.map((r) => ({
            ...r,
            profile: profileMap[r.user_id] || null,
        }));

        setComments(merged);
        setLoading(false);
    }

    async function sendComment() {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (!user || !text.trim()) return;

        const payload = {
            post_id: postId,
            user_id: user.id,
            comment_text: text.trim(),
        };

        const { error } = await supabase.from("media_comments").insert(payload);
        if (error) {
            console.error("insert comment error:", error);
            return;
        }

        setText("");
        fetchComments();
    }

    async function deleteComment(commentId) {
        if (!meId) return;

        // Important: this requires RLS policy to allow delete where user_id = auth.uid()
        const { error } = await supabase
            .from("media_comments")
            .delete()
            .eq("id", commentId)
            .eq("user_id", meId);

        if (error) {
            console.error("delete comment error:", error);
            alert("Could not delete comment (check RLS policy).");
            return;
        }

        // update UI immediately
        const next = comments.filter((c) => c.id !== commentId);
        setComments(next);
        onCountChange?.(next.length);
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
            <div className="bg-[#1a1a1a] w-full max-h-[70%] rounded-t-xl p-4">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold">Comments</span>
                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                {/* COMMENTS */}
                <div className="space-y-3 overflow-y-auto max-h-[300px]">
                    {loading && <div className="text-sm text-gray-400">Loading...</div>}

                    {!loading && comments.length === 0 && (
                        <div className="text-sm text-gray-400">No comments yet.</div>
                    )}

                    {comments.map((c) => {
                        const profile = c.profile || profilesById[c.user_id] || null;
                        const isMine = meId && c.user_id === meId;

                        return (
                            <div key={c.id} className="flex gap-2 items-start">
                                <img
                                    src={profile?.avatar_url || "https://via.placeholder.com/40"}
                                    className="w-8 h-8 rounded-full object-cover"
                                    alt=""
                                />

                                <div className="flex-1 text-sm">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                      <span className="font-semibold mr-1">
                        {profile?.username || "Unknown"}:
                      </span>
                                            {c.comment_text}
                                        </div>

                                        {isMine && (
                                            <button
                                                onClick={() => deleteComment(c.id)}
                                                className="text-gray-400 hover:text-red-400 p-1"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* INPUT */}
                <div className="flex gap-2 mt-4">
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-black border border-white/10 rounded px-3 py-2 text-white"
                    />
                    <button onClick={sendComment} className="text-blue-500 font-semibold">
                        Post
                    </button>
                </div>
            </div>
        </div>
    );
}
