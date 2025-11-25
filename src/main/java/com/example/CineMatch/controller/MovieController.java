package com.example.CineMatch.controller;

import com.example.CineMatch.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tmdb")
public class MovieController {

    private final MovieService movieService;

    @Autowired
    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    // Sends one page worth of Trending Movies
    // http://localhost:8080/api/tmdb/trending/movies?page=1
    @GetMapping("/trending/movies")
    public Object getTrendingMovies(@RequestParam(defaultValue = "1") int page) {
        return movieService.getTrendingMovies(page);
    }

    // Returns the full details on a specific Movie
    // http://localhost:8080/api/tmdb/movie/ [ID NUMBER]
    @GetMapping("/movie/{id}")
    public Object getMovieById(@PathVariable long id) {
        return movieService.getMovieById(id);
    }
}