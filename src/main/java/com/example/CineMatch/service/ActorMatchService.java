package com.example.CineMatch.service;

import com.example.CineMatch.model.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class ActorMatchService {

    // Keys
    @Value("${HUGGINGFACE_API_KEY}")
    private String huggingfaceApiKey;

    @Value("${TMDB_API_KEY}")
    private String tmdbApiKey;

    // Constants
    private static final String HF_MODEL_ID = "hafizulloevich/actorFaceRecognition";
    private static final String HF_ENDPOINT = "https://router.huggingface.co/models/";
    private static final String TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/person";
    private static final String TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

    // Constructor Injection για το Mocking
    private final RestTemplate restTemplate;

    @Autowired
    public ActorMatchService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ActorMatchService() {
        this.restTemplate = new RestTemplate();
    }


    public ActorMatchResponse findAndResolveMatch(MultipartFile photo) throws Exception {

        // 1. Hugging Face API Call
        // Αυτή η μέθοδος είναι πλέον public (και μπορεί να γίνει mock)
        List<HuggingFaceClassificationResult> hfResults = callHuggingFaceApi(photo);

        if (hfResults == null || hfResults.isEmpty()) {
            return new ActorMatchResponse("No match", 0, "No result from AI model.");
        }

        HuggingFaceClassificationResult topMatch = hfResults.get(0);
        String actorName = topMatch.getLabel();
        float score = topMatch.getScore();

        // 2. Tmdb Search
        String actorImageUrl = searchTmdbForImageUrl(actorName);

        // 3. Return POJO
        return new ActorMatchResponse(actorName, score, actorImageUrl);
    }

    // 🚨 ΔΙΟΡΘΩΣΗ: Η μέθοδος γίνεται public για να μπορεί να γίνει Spy/Mock
    public List<HuggingFaceClassificationResult> callHuggingFaceApi(MultipartFile photo) throws Exception {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(huggingfaceApiKey);
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

        HttpEntity<byte[]> entity = new HttpEntity<>(photo.getBytes(), headers);
        String url = HF_ENDPOINT + HF_MODEL_ID;

        //  ParameterizedTypeReference List<POJO> mapping
        ResponseEntity<List<HuggingFaceClassificationResult>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<List<HuggingFaceClassificationResult>>() {}
        );

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return response.getBody();
        } else {
            throw new RuntimeException("Hugging Face API call failed: " + response.getStatusCode());
        }
    }

    public String searchTmdbForImageUrl(String name) {

        String url = UriComponentsBuilder.fromUriString(TMDB_SEARCH_URL)
                .queryParam("api_key", tmdbApiKey)
                .queryParam("query", name)
                .toUriString();

        try {
            ResponseEntity<TmdbSearchResponse> response = restTemplate.getForEntity(url, TmdbSearchResponse.class);
            TmdbSearchResponse searchResponse = response.getBody();

            if (searchResponse != null && searchResponse.getResults() != null && !searchResponse.getResults().isEmpty()) {
                TmdbPersonResult firstPerson = searchResponse.getResults().get(0);
                String profilePath = firstPerson.getProfile_path();

                if (profilePath != null && !profilePath.isEmpty()) {
                    return TMDB_IMAGE_BASE_URL + profilePath;
                }
            }
        } catch (Exception e) {
            System.err.println("Error searching TMDb for actor image: " + e.getMessage());
        }
        return null;
    }
}