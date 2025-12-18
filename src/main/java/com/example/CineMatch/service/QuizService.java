package com.example.CineMatch.service;

import com.example.CineMatch.dto.QuizQuestion;
import com.example.CineMatch.dto.UserAnswer;
import com.example.CineMatch.dto.GenreAffinity;
import com.example.CineMatch.Repository.UserPreferenceRepository;
import com.example.CineMatch.dto.UserPreference;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatusCode;

import java.util.*;


@Service
public class QuizService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final UserPreferenceRepository userPreferenceRepository;



    @Value("${llm.api.key}")
    private String apiKey;

    private static final String OPENROUTER_ENDPOINT =
            "https://openrouter.ai/api/v1/chat/completions";

    // Free & good
    private static final String MODEL_ID =
            "mistralai/mistral-7b-instruct";



    // CONSTRUCTOR: Χρειάζεται WebClient και Repository
    public QuizService(WebClient webClient, UserPreferenceRepository userPreferenceRepository) {
        this.webClient = webClient;
        this.userPreferenceRepository = userPreferenceRepository;
    }

    // =================================================================
    // 1. RANKED QUIZ
    // =================================================================
    public List<QuizQuestion> generateRankedQuiz() throws Exception {
        String prompt = buildRankedQuizPrompt()
                + "\nRandom seed: " + UUID.randomUUID();

        int attempts = 0;
        Exception lastError = null;

        while (attempts < 3) {
            try {
                String jsonResponse = callLlmApi(prompt);
                String cleaned = cleanLlmOutput(jsonResponse);
                return parseLlmResponse(cleaned);
            } catch (Exception e) {
                lastError = e;
                attempts++;
            }
        }

        throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Failed to generate valid ranked quiz after retries",
                lastError
        );
    }


    private String buildRankedQuizPrompt() {
        return """
You are a professional cinema trivia engine used in a ranked competitive game.

TASK:
Generate EXACTLY 10 cinema trivia questions.

ERA CONSTRAINT (VERY IMPORTANT):
- At least 6 questions MUST be about films released in the year 2000 or later
- Remaining questions may include late 1990s at earliest
- Avoid pre-1990 cinema unless absolutely necessary

DIFFICULTY RULES:
- Difficulty: medium to hard
- Modern difficulty is allowed (cinematography, festivals, international cinema, directors, production facts)
- Do NOT rely on silent-era or golden-age cinema to create difficulty

CONTENT RULES:
- No subjective or opinion-based questions
- One and only one correct answer per question
- No repeating movies, directors, actors, or franchises
- Each question must cover a DIFFERENT film or topic

ANTI-REPETITION:
- Assume the user has played before
- Avoid common trivia patterns
- Prefer less obvious but verifiable facts

FORMAT (STRICT):
- Output ONLY a valid JSON array
- No markdown
- No text before or after JSON

JSON SCHEMA:
[
  {
    "questionText": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswerIndex": 0,
    "explanation": "string"
  }
]

If you violate ANY rule, the output is invalid.

Generate now.
""";
    }


    // =================================================================
    // 2. PERSONALIZED QUIZ (DATABASE DRIVEN)
    // =================================================================
    public List<QuizQuestion> generatePersonalizedQuiz(UUID userId) throws Exception {

        // 1. Διάβασμα Affinity από τη Βάση Δεδομένων
        Optional<UserPreference> userPrefOpt = userPreferenceRepository.findByUserId(userId);

        if (userPrefOpt.isEmpty()) {
            return generateRankedQuiz();
        }

        // Το userPrefOpt.get() επιστρέφει το UserPreference object.
        UserPreference userPreference = userPrefOpt.get();

        // 2. Μετατροπή JSON String σε List<GenreAffinity>
        List<GenreAffinity> affinities = userPreference.getGenreAffinityList();

        if (affinities.isEmpty()) {
            return generateRankedQuiz();
        }

        // 3. Επιλογή των Top 3 Genres
        List<String> top3Genres = affinities.stream()
                .limit(3)
                .map(GenreAffinity::getGenre)
                .toList();

        // 4. Δημιουργία Prompt
        String prompt = buildPersonalizedQuizPrompt(top3Genres)
                + "\nRandom seed: " + UUID.randomUUID();
        String jsonResponse = callLlmApi(prompt);
        return parseLlmResponse(jsonResponse);
    }

    private String buildPersonalizedQuizPrompt(List<String> genres) {
        String genreList = String.join(", ", genres);

        return String.format(
                "You are a cinema quiz generator.\n" +
                        "Generate 10 COMPLETELY DIFFERENT multiple-choice questions (4 options each).\n" +
                        "Rules:\n" +
                        "- Do NOT reuse famous or common examples repeatedly\n" +
                        "- Avoid starting with the same movie every time\n" +
                        "- Use a RANDOM mix of mainstream, cult, and lesser-known films\n" +
                        "- Vary the order of difficulty\n" +
                        "- Each question must be independent\n\n" +
                        "Genres to focus on: %s\n\n" +
                        "Return ONLY a valid JSON array with this schema:\n" +
                        "[{questionText, options, correctAnswerIndex, explanation}]\n" +
                        "No extra text.\n\n" +
                        "Randomization token: %s",
                genreList,
                UUID.randomUUID()
        );

    }

    // =================================================================
    // 3. COMMON API CALL LOGIC
    // =================================================================

    private String callLlmApi(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "OpenRouter API key is missing."
            );
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", MODEL_ID);
        requestBody.put("messages", List.of(
                Map.of("role", "user", "content", prompt)
        ));
        requestBody.put("temperature", 0.8);
        requestBody.put("max_tokens", 1500);

        try {
            Map<String, Object> response = webClient.post()
                    .uri(OPENROUTER_ENDPOINT)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .header("HTTP-Referer", "http://localhost:8080") // required
                    .header("X-Title", "CineMatch")                  // required
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .map(body ->
                                            new ResponseStatusException(
                                                    clientResponse.statusCode(),
                                                    "OpenRouter API Error: " + body
                                            )
                                    )
                    )
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();


            List<Map<String, Object>> choices =
                    (List<Map<String, Object>>) response.get("choices");

            Map<String, Object> message =
                    (Map<String, Object>) choices.get(0).get("message");

            return message.get("content").toString();

        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "OpenRouter API error: " + e.getMessage()
            );
        }
    }




    // =================================================================
    // 4. COMMON UTILITIES & GRADING
    // =================================================================

    private List<QuizQuestion> parseLlmResponse(String jsonString) throws Exception {
        // Διορθώθηκε η αναφορά (TypeReference)
        if (jsonString.trim().startsWith("```json")) {
            jsonString = jsonString.trim().substring(7);
        }
        if (jsonString.trim().endsWith("```")) {
            jsonString = jsonString.trim().substring(0, jsonString.trim().length() - 3);
        }

        return objectMapper.readValue(
                jsonString,
                new TypeReference<List<QuizQuestion>>() {}
        );
    }

    private String cleanLlmOutput(String text) {
        // Διορθώθηκε η αναφορά (cleanLlmOutput)
        if (text == null) return "";
        text = text.trim();

        if (text.contains("[/INST]")) {
            text = text.substring(text.indexOf("[/INST]") + 7).trim();
        }

        if (text.startsWith("```json")) {
            text = text.substring(7).trim();
        }
        if (text.endsWith("```")) {
            text = text.substring(0, text.length() - 3).trim();
        }

        if (text.contains("[")) {
            int startIndex = text.indexOf('[');
            int endIndex = text.lastIndexOf(']');
            if (startIndex != -1 && endIndex != -1) {
                return text.substring(startIndex, endIndex + 1);
            }
        }
        return text;
    }

    public int calculateScore(List<QuizQuestion> originalQuestions, List<UserAnswer> userAnswers) {
        int finalScore = 0;
        if (originalQuestions == null || userAnswers == null || originalQuestions.size() != userAnswers.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid submission data or mismatched question/answer count.");
        }

        for (UserAnswer userAnswer : userAnswers) {
            int qIndex = userAnswer.getQuestionIndex();
            if (qIndex < 0 || qIndex >= originalQuestions.size()) {
                continue;
            }

            int selectedIndex = userAnswer.getSelectedOptionIndex();
            int correctIndex = originalQuestions.get(qIndex).getCorrectAnswerIndex();

            if (selectedIndex == correctIndex) {
                finalScore++;
            }
        }
        return finalScore;
    }
    public int calculateRankedScore(
            int correct,
            int wrong,
            int timeTakenSeconds
    ) {
        int POINTS_PER_CORRECT = 50;
        int PENALTY_PER_WRONG = 30;

        int baseScore = (correct * POINTS_PER_CORRECT)
                - (wrong * PENALTY_PER_WRONG);

        int maxTime = 120; // 2 minutes
        int timeBonus = Math.max(0, maxTime - timeTakenSeconds);

        return baseScore + timeBonus;
    }
}