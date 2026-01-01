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
 */import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FavoritesButton() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate("/favorites")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:bg-card/80 transition"
        >
            <Heart className="w-5 h-5 text-red-500" />
            <span>Favorites</span>
        </button>
    );
}
