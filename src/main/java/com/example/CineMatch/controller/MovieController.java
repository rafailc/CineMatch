package com.example.CineMatch.controller;

import com.example.CineMatch.dto.MovieDTO;
import com.example.CineMatch.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*")
public class MovieController {

    private final MovieService movieService;

    @Autowired
    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }


    @GetMapping("/trending")
    public ResponseEntity<List<MovieDTO>> getTrendingMovies() {
        try {
            List<MovieDTO> trendingMovies = movieService.getTrendingMovies();
            return ResponseEntity.ok(trendingMovies);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}