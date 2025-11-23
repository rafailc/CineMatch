package com.example.CineMatch.service;

import com.example.CineMatch.dto.MovieDTO;
import java.util.List;

public interface MovieService {
    List<MovieDTO> getTrendingMovies();
    MovieDTO getMovieById(String id);
    List<MovieDTO> getMoviesByGenre(String genre);
}