package com.example.CineMatch.service;

import java.util.Map;

public interface MovieService {
    Map<String, Object> getMovieById(long id);
    String getTrendingMovies(int page);
    String getTrendingTv(int page);
    String getTrendingPerson(int page);
    String searchMovies(String q, int page);
    String searchTv(String q, int page);
    String searchPerson(String q, int page);
    Map<String, Object> discoverMovies(String q);
    Map<String, Object> discoverTV(String q);
}