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


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.CineMatch.dto.GenreAffinity;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user_preferences")
@Data
@NoArgsConstructor
public class UserPreference {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    // Το genre_affinity είναι JSONB/TEXT στη βάση. Το διαβάζουμε ως String και το μετατρέπουμε.
    @Column(name = "genre_affinity")
    @JdbcTypeCode(SqlTypes.JSON)
    private String genreAffinityJson;

    // Μέθοδος μετατροπής του JSON string σε List<GenreAffinity>
    public List<GenreAffinity> getGenreAffinityList() {
        if (genreAffinityJson == null || genreAffinityJson.isBlank()) {
            return List.of();
        }
        try {
            // Χρησιμοποιούμε ObjectMapper για να μετατρέψουμε το JSONB/TEXT σε List<GenreAffinity>
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(genreAffinityJson, new TypeReference<List<GenreAffinity>>() {});
        } catch (Exception e) {
            System.err.println("Error parsing genre_affinity JSON: " + e.getMessage());
            return List.of();
        }
    }
}