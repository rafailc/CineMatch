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
public class TvServiceImpl implements TvService {

    private final TmdbRepository tmdbRepository;
    private final ObjectMapper objectMapper;

    @Autowired
     public TvServiceImpl(TmdbRepository tmdbRepository, ObjectMapper objectMapper) {
        this.tmdbRepository = tmdbRepository;
        this.objectMapper = objectMapper;
    }

    // TRENDING
    @Override
    public ResponseDto<TvDto> getTrending(int page) {
        String json = tmdbRepository.call("/trending/tv/week?page=" + page);
        JavaType type = objectMapper.getTypeFactory()
                .constructParametricType(ResponseDto.class, TvDto.class);

        return objectMapper.readValue(json, type);
    }

    // SEARCH
    public ResponseDto<TvDto> getSearch(String q, int page) {
        String json = tmdbRepository.call("/search/tv?query=" + q + "&page=" + page);
        JavaType type = objectMapper.getTypeFactory()
                .constructParametricType(ResponseDto.class, TvDto.class);

        return objectMapper.readValue(json, type);
    }

    // DISCOVER
    public ResponseDto<TvDto> getDiscover(String q) {
        String json = tmdbRepository.call("/discover/tv" + q);
        JavaType type = objectMapper.getTypeFactory()
                .constructParametricType(ResponseDto.class, TvDto.class);

        return objectMapper.readValue(json, type);
    }

    // DETAILS
    public TvDetailsDto getDetails(long id) {
        Map<String, Object> details =
                new HashMap<>(tmdbRepository.callMap("/tv/" + id));
        Map<String, Object> credits =
                tmdbRepository.callMap("/tv/" + id + "/credits");

        details.put("cast", credits.get("cast"));

        String json = objectMapper.writeValueAsString(details);
        TvDetailsDto dto = objectMapper.readValue(json, TvDetailsDto.class);

        if (dto.getId() == null || dto.getName() == null) {
            throw new RuntimeException("Invalid tv details received from TMDB");
        }

        return dto;
    }
}