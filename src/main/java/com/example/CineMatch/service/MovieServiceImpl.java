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

import com.example.CineMatch.Repository.TmdbRepository;
import com.example.CineMatch.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JavaType;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@Service
public class MovieServiceImpl implements MovieService {

    private final TmdbRepository tmdbRepository;
    private final ObjectMapper objectMapper;

    @Autowired
     public MovieServiceImpl(TmdbRepository tmdbRepository, ObjectMapper objectMapper) {
        this.tmdbRepository = tmdbRepository;
        this.objectMapper = objectMapper;
    }

    // TRENDING
    @Override
    public ResponseDto<MovieDto> getTrending(int page) {
        String json = tmdbRepository.call("/trending/movie/week?page=" + page);
        JavaType type = objectMapper.getTypeFactory()
                .constructParametricType(ResponseDto.class, MovieDto.class);

        return objectMapper.readValue(json, type);
    }

    // SEARCH
    @Override
    public ResponseDto<MovieDto> getSearch(String q, int page) {
        String json = tmdbRepository.call("/search/movie?query=" + q + "&page=" + page);
        JavaType type = objectMapper.getTypeFactory()
                .constructParametricType(ResponseDto.class, MovieDto.class);

        return objectMapper.readValue(json, type);
    }

    // DISCOVER
    @Override
    public ResponseDto<MovieDto> getDiscover(String q) {
        String json = tmdbRepository.call("/discover/movie" + q);
        JavaType type = objectMapper.getTypeFactory()
                .constructParametricType(ResponseDto.class, MovieDto.class);

        return objectMapper.readValue(json, type);
    }

    // DETAILS
    @Override
    public MovieDetailsDto getDetails(long id) {
        Map<String, Object> details =
                new HashMap<>(tmdbRepository.callMap("/movie/" + id));
        Map<String, Object> credits =
                tmdbRepository.callMap("/movie/" + id + "/credits");

        details.put("cast", credits.get("cast"));

        String json = objectMapper.writeValueAsString(details);
        MovieDetailsDto dto = objectMapper.readValue(json, MovieDetailsDto.class);

        if (dto.getId() == null || dto.getTitle() == null) {
            throw new RuntimeException("Invalid movie details received from TMDB");
        }

        return dto;
    }
}