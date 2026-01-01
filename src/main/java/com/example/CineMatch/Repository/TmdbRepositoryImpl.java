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
 */package com.example.CineMatch.Repository;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class TmdbRepositoryImpl implements TmdbRepository {
    private static final String API_KEY = System.getenv("TMDB_API_KEY");
    private static final String TMDB = "https://api.themoviedb.org/3";

    private final RestTemplate rest = new RestTemplate();

    @Override
    public String call(String endpoint) {
        String url = TMDB + endpoint + (endpoint.contains("?") ? "&" : "?") + "api_key=" + API_KEY;
        return rest.getForObject(url, String.class);
    }

    @Override
    public Map<String, Object> callMap(String endpoint) {
        String url = TMDB + endpoint + (endpoint.contains("?") ? "&" : "?") + "api_key=" + API_KEY;
        return rest.getForObject(url, Map.class);
    }
}