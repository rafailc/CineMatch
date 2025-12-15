package com.example.CineMatch.dto;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.CineMatch.dto.GenreAffinity;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

@Entity
@Table(name = "user_preferences")
@Data
@NoArgsConstructor
public class UserPreference {

    @Id
    @Column(name = "user_id")
    private String userId;

    // Το genre_affinity είναι JSONB/TEXT στη βάση. Το διαβάζουμε ως String και το μετατρέπουμε.
    @Column(name = "genre_affinity")
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