package com.example.CineMatch.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmission {
    // User Answers
    private List<UserAnswer> userAnswers;

    // All Questions
    private List<QuizQuestion> originalQuestions;
}