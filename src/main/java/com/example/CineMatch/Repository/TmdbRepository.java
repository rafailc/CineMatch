package com.example.CineMatch.Repository;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class TmdbRepository {
    private static final String API_KEY = System.getenv("TMDB_API_KEY");
    private static final String TMDB = "https://api.themoviedb.org/3";

    private final RestTemplate rest = new RestTemplate();

    public String call(String endpoint) {
        String url = TMDB + endpoint + (endpoint.contains("?") ? "&" : "?") + "api_key=" + API_KEY;
        return rest.getForObject(url, String.class);
    }

    public Map<String, Object> callMap(String endpoint) {
        String url = TMDB + endpoint + (endpoint.contains("?") ? "&" : "?") + "api_key=" + API_KEY;
        return rest.getForObject(url, Map.class);
    }
}