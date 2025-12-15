package com.example.CineMatch.controller;

import com.example.CineMatch.dto.QuizSubmission;
import com.example.CineMatch.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final QuizService quizService;

    @Autowired
    public QuizController(QuizService quizService) {
        this.quizService = quizService;
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