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
 */import "../styles/genre-radio.css";

export default function GenreRadioGroup({ genres, value, onChange }) {
    return (
        <div className="radio-grid">
            {genres.map((g, index) => (
                <label key={index} className="label">
                    <input
                        type="radio"
                        name="genre-radio"
                        value={g}
                        checked={value === g}
                        onChange={() => onChange(g)}
                    />
                    <p className="text">{g}</p>
                </label>
            ))}

            {/* Allow "All Genres" option */}
            <label className="label">
                <input
                    type="radio"
                    name="genre-radio"
                    value=""
                    checked={value === ""}
                    onChange={() => onChange("")}
                />
                <p className="text">All Genres</p>
            </label>
        </div>
    );
}