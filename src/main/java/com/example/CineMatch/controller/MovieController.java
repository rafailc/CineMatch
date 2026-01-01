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
 */package com.example.CineMatch.controller;

import com.example.CineMatch.dto.MovieDetailsDto;
import com.example.CineMatch.dto.MovieDto;
import com.example.CineMatch.dto.ResponseDto;
import com.example.CineMatch.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tmdb")
public class MovieController {

    private final MovieService movieService;

    @Autowired
    public MovieController(MovieService tmdbService) {
        this.movieService = tmdbService;
    }

    /* Trending */
    @GetMapping("/trending/movies")
    public ResponseDto<MovieDto> getTrendingMovies(@RequestParam(defaultValue = "1") int page) {
        return movieService.getTrending(page);
    }

    /* Search */
    @GetMapping("/search/movies")
    public ResponseDto<MovieDto> searchMovies(@RequestParam String q, @RequestParam(defaultValue = "1") int page) {
        return movieService.getSearch(q, page);
    }

    /* Discover */
    @GetMapping("/discover/movies")
    public ResponseDto<MovieDto> discoverMovies(@RequestParam Map<String, String> params) {
        StringBuilder query = new StringBuilder("?");
        params.forEach((key, value) -> {
            query.append(key).append("=").append(value).append("&");
        });
        return movieService.getDiscover(query.toString());
    }

    /* Details */
    @GetMapping("/movie/{id}")
    public MovieDetailsDto movieDetails(@PathVariable long id) {
        return movieService.getDetails(id);
    }
}