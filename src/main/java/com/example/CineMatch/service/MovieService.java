package com.example.CineMatch.service;

import java.util.Map;

public interface MovieService {
    String getTrendingMovies(int page);
    Map<String, Object> getMovieById(long id);
}