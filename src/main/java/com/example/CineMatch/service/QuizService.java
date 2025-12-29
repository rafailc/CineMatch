package com.example.CineMatch.service;

import com.example.CineMatch.dto.QuizQuestion;
import com.example.CineMatch.dto.UserAnswer;

import java.util.List;
import java.util.UUID;

public interface QuizService {

    List<QuizQuestion> generateRankedQuiz() throws Exception;
    List<QuizQuestion> generatePersonalizedQuiz(UUID userId) throws Exception;
    int calculateScore(List<QuizQuestion> originalQuestions, List<UserAnswer> userAnswers);
    int calculateRankedScore(
            int correct,
            int wrong,
            int timeTakenSeconds
    );
}
