package com.example.CineMatch.dto;


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