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
 */package com.example.CineMatch.controller;

import com.example.CineMatch.dto.QuizQuestion;
import com.example.CineMatch.dto.QuizSubmission;
import com.example.CineMatch.dto.RankedScoreRequest;
import com.example.CineMatch.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS }
)
public class QuizController {

    private final QuizService quizService;

    @Autowired
    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/personalized/{userId}")
    public ResponseEntity<List<QuizQuestion>> getPersonalizedQuiz(
            @PathVariable String userId
    ) throws Exception {

        UUID uuid = UUID.fromString(userId);

        List<QuizQuestion> questions =
                quizService.generatePersonalizedQuiz(uuid);

        return ResponseEntity.ok(questions);
    }

    @PostMapping("/ranked/score")
    public int calculateRankedScore(@RequestBody RankedScoreRequest request) {
        return quizService.calculateRankedScore(
                request.getCorrect(),
                request.getWrong(),
                request.getTimeTakenSeconds()
        );
    }
    @GetMapping("/ranked")
    public List<QuizQuestion> getRankedQuiz() throws Exception {
        return quizService.generateRankedQuiz();
    }
    // SUBMIT (Ranked  Personalized)
    // Endpoint: /api/quiz/submit
    @PostMapping("/submit")
    public ResponseEntity<Integer> submitQuiz(@RequestBody QuizSubmission quizSubmission) {
        int score = quizService.calculateScore(
                quizSubmission.getOriginalQuestions(),
                quizSubmission.getUserAnswers()
        );
        return ResponseEntity.ok(score);
    }
}
