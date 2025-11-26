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

    // Request a page's worth of trending movies from Tmdb Repository
    @Override
    public String getTrendingMovies(int page) {
        return tmdbRepository.call("/trending/movie/week?page=" + page);
    }

    // Maps full data for one movie (of a given id) from Tmdb Repository
    @Override
    public Map<String, Object> getMovieById(long id) {
        Map<String, Object> details = tmdbRepository.callMap("/movie/" + id);
        Map<String, Object> credits = tmdbRepository.callMap("/movie/" + id + "/credits");
        details.put("credits", credits);
        return details;
    }
}