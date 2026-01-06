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
import com.example.CineMatch.dto.MovieDto;
import com.example.CineMatch.dto.ResponseDto;
import com.example.CineMatch.dto.TvDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JavaType;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;

@Service
public class NewHotServiceImpl implements NewHotService {

    private final TmdbRepository tmdbRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public NewHotServiceImpl(TmdbRepository tmdbRepository, ObjectMapper objectMapper) {
        this.tmdbRepository = tmdbRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public ResponseDto<MovieDto> nowPlayingMovies(int page) {
        String json = tmdbRepository.call("/movie/now_playing?page=" + Math.max(page, 1));
        JavaType type = objectMapper.getTypeFactory()
                .constructParametricType(ResponseDto.class, MovieDto.class);

        return objectMapper.readValue(json, type);
    }

    @Override
    public ResponseDto<MovieDto> upcomingMoviesFuture(int page, String region) {
        String today = LocalDate.now().toString();
        String r = (region == null || region.isBlank()) ? "US" : region;

        String path = "/discover/movie?language=en-US"
                + "&region=" + r
                + "&sort_by=popularity.desc"
                + "&include_adult=false"
                + "&include_video=false"
                + "&primary_release_date.gte=" + today
                + "&page=" + Math.max(page, 1);

        String json = tmdbRepository.call(path);

        JavaType type = objectMapper.getTypeFactory()
                .constructParametricType(ResponseDto.class, MovieDto.class);

        return objectMapper.readValue(json, type);
    }

    @Override
    public ResponseDto<TvDto> onTheAirTv(int page) {
        String json = tmdbRepository.call("/tv/on_the_air?page=" + Math.max(page, 1));
        JavaType type = objectMapper.getTypeFactory()
                .constructParametricType(ResponseDto.class, TvDto.class);

        return objectMapper.readValue(json, type);
    }
}