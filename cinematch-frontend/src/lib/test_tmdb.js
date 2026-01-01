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
 */const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

export async function testTmdb() {
    try {
        console.log(" Testing TMDB trending fetch...");

        const res = await fetch(
            `${TMDB_BASE}/trending/movie/day?api_key=${API_KEY}`
        );

        if (!res.ok) {
            console.error(" TMDB returned an error:", res.status);
            return null;
        }

        const data = await res.json();
        return data.results;
    } catch (err) {
        console.error(" TMDB Test Failed:", err);
        return null;
    }
}