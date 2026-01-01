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
import { useNavigate } from "react-router-dom";

export default function RankedStart() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadLeaderboard();
    }, []);

    async function loadLeaderboard() {
        const { data, error } = await supabase
            .from("ranked_leaderboard_view")
            .select("*")
            .limit(20);

        if (error) {
            console.error(error);
        } else {
            setLeaderboard(data || []);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-background px-6 py-10 pt-24">
            <h1 className="text-4xl font-bold mb-6">🏆 Ranked Quiz</h1>

            <button
                onClick={() => navigate("/quiz/ranked/play")}
                className="mb-8 px-6 py-3 bg-primary text-white rounded-lg"
            >
                Start Ranked Quiz
            </button>

            <h2 className="text-2xl font-semibold mb-4">Leaderboard</h2>

            {loading ? (
                <p>Loading leaderboard...</p>
            ) : (
                <div className="bg-card rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="border-b">
                        <tr>
                            <th className="p-3">#</th>
                            <th className="p-3">Username</th>
                            <th className="p-3">Quizzes</th>
                            <th className="p-3">Avg Time</th>
                            <th className="p-3">Score</th>
                        </tr>
                        </thead>
                        <tbody>
                        {leaderboard.map((u, i) => (
                            <tr key={u.user_id} className="border-b">
                                <td className="p-3">{i + 1}</td>
                                <td className="p-3">{u.username}</td>
                                <td className="p-3">{u.quizzes_taken}</td>
                                <td className="p-3">{u.avg_time_seconds}s</td>
                                <td className="p-3 font-bold">{u.total_score}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
