package com.example.CineMatch.service;

import com.example.CineMatch.Repository.TmdbRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class MovieServiceImpl implements MovieService {

    private final TmdbRepository tmdbRepository;

    @Autowired
     public MovieServiceImpl(TmdbRepository tmdbRepository) {
        this.tmdbRepository = tmdbRepository;
    }

    // Maps full data for one movie (of a given id) from Tmdb Repository
    @Override
    public Map<String, Object> getMovieById(long id) {
        Map<String, Object> details = tmdbRepository.callMap("/movie/" + id);
        Map<String, Object> credits = tmdbRepository.callMap("/movie/" + id + "/credits");
        details.put("credits", credits);
        return details;
    }

    // Request a page's worth of trending movies from Tmdb Repository
    @Override
    public String getTrendingMovies(int page) {
        return tmdbRepository.call("/trending/movie/week?page=" + page);
    }

    // Request a page's worth of trending TV series
    @Override
    public String getTrendingTv(int page) {
        return tmdbRepository.call("/trending/tv/week?page=" + page);
    }

    // Request a page's worth of trending Actors & Director
    @Override
    public String getTrendingPerson(int page) {
        return tmdbRepository.call("/trending/person/week?page=" + page);

    }

     // SEARCH

    public String searchMovies(String q, int page) { return tmdbRepository.call("/search/movie?query=" + q + "&page=" + page); }
    public String searchPerson(String q, int page) { return tmdbRepository.call("/search/person?query=" + q + "&page=" + page); }
    public String searchTv(String q, int page) { return tmdbRepository.call("/search/tv?query=" + q + "&page=" + page); }
}