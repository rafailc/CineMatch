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
 */package com.example.CineMatch.service;

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
