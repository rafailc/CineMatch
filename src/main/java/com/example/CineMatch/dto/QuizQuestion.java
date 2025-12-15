package com.example.CineMatch.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestion {
    private String questionText;
    private List<String> options;

    // Correct Answer Index (0, 1, 2, 3)
    private int correctAnswerIndex;

    private String explanation;
}