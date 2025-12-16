package com.example.CineMatch.controller;

import com.example.CineMatch.dto.QuizQuestion;
import com.example.CineMatch.dto.QuizSubmission;
import com.example.CineMatch.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/quiz")
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