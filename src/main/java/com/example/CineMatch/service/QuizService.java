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

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;



@Service
public class QuizService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final UserPreferenceRepository userPreferenceRepository;

    @Value("${huggingface.api.key}")
    private String apiKey;

    private static final String MODEL_ID = "meta-llama/Llama-2-7b-chat-hf";
    private static final String HF_ENDPOINT = "https://router.huggingface.co/models/";


    // CONSTRUCTOR: Χρειάζεται WebClient και Repository
    public QuizService(WebClient webClient, UserPreferenceRepository userPreferenceRepository) {
        this.webClient = webClient;
        this.userPreferenceRepository = userPreferenceRepository;
    }

    // =================================================================
    // 1. RANKED QUIZ
    // =================================================================
    public List<QuizQuestion> generateRankedQuiz() throws Exception {
        String prompt = buildRankedQuizPrompt();
        String jsonResponse = callLlmApi(prompt);
        return parseLlmResponse(jsonResponse);
    }

    private String buildRankedQuizPrompt() {
        return String.format(
                "[INST] You are a cinema quiz generator. Generate 10 multiple-choice questions (4 options each) covering general cinema knowledge. "
                        + "Return the output as a single, valid JSON array conforming to the QuizQuestion POJO schema (questionText, options, correctAnswerIndex: 0-3, explanation). "
                        + "Do not include any text, markdown, or commentary outside the JSON array. [/INST]"
        );
    }

    // =================================================================
    // 2. PERSONALIZED QUIZ (DATABASE DRIVEN)
    // =================================================================
    public List<QuizQuestion> generatePersonalizedQuiz(String userId) throws Exception {

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
        String prompt = buildPersonalizedQuizPrompt(top3Genres);
        String jsonResponse = callLlmApi(prompt);
        return parseLlmResponse(jsonResponse);
    }

    private String buildPersonalizedQuizPrompt(List<String> genres) {
        String genreList = String.join(", ", genres);

        return String.format(
                "[INST] You are a cinema quiz generator. Generate 10 multiple-choice questions (4 options each) focused specifically on the following cinema genres: %s. "
                        + "Return the output as a single, valid JSON array conforming to the QuizQuestion POJO schema (questionText, options, correctAnswerIndex: 0-3, explanation). "
                        + "Do not include any text, markdown, or commentary outside the JSON array. [/INST]",
                genreList
        );
    }

    // =================================================================
    // 3. COMMON API CALL LOGIC
    // =================================================================

    private String callLlmApi(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "HUGGINGFACE_API_KEY is missing."
            );
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("inputs", prompt);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("max_new_tokens", 1500);
        parameters.put("do_sample", false);
        parameters.put("temperature", 0.1);
        parameters.put("stop", List.of("[/INST]", "```"));

        requestBody.put("parameters", parameters);

        String url = HF_ENDPOINT + MODEL_ID;


        try {
            List<Map<String, String>> response = webClient.post()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse -> {
                        return clientResponse.bodyToMono(String.class)
                                .map(errorBody -> new ResponseStatusException(
                                        clientResponse.statusCode(),
                                        "LLM API Error: " + errorBody
                                ));
                    })
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, String>>>() {})
                    .block();

            if (response == null || response.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "LLM returned empty response.");
            }

            String generatedText = response.get(0).get("generated_text");
            return cleanLlmOutput(generatedText); // Η μέθοδος υπάρχει παρακάτω

        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error calling LLM API: " + e.getMessage()
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
}