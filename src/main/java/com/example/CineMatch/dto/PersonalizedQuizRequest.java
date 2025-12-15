package com.example.CineMatch.dto;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalizedQuizRequest {
    /**
     * Τα 3 κορυφαία genres που υπολογίστηκαν στο Frontend
     * (π.χ., "Action", "Comedy", "Sci-Fi").
     */
    private List<String> preferredGenres;
}