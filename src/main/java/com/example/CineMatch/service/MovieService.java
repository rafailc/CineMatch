package com.example.CineMatch.service;

import java.util.Map;

public interface MovieService {
    Map<String, Object> getMovieById(long id);
    String getTrendingMovies(int page);
    String getTrendingTv(int page);
    String getTrendingPerson(int page);
}