/*
 * CineMatch
 * Copyright (C) 2025 <Make a Wish team>
 * Authors: see AUTHORS.md
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed WITHOUT ANY WARRANTY.
 * See the GNU General Public License for more details.
 *
 * If not, see <https://www.gnu.org/licenses/>.
 */package com.example.CineMatch.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Αυτό το DTO αντιστοιχεί στη δομή [{"genre": "Action", "percentage": 35}]
// που βρίσκεται μέσα στο πεδίο genre_affinity της βάσης δεδομένων.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenreAffinity {
    private String genre;
    private int percentage;
}