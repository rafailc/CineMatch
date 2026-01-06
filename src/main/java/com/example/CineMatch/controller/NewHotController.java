package com.example.CineMatch.controller;

import com.example.CineMatch.dto.MovieDto;
import com.example.CineMatch.dto.ResponseDto;
import com.example.CineMatch.dto.TvDto;
import com.example.CineMatch.service.NewHotService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/newhot")
@CrossOrigin(origins = "http://localhost:5173")
public class NewHotController {

    private final NewHotService newHotService;

    public NewHotController(NewHotService newHotService) {
        this.newHotService = newHotService;
    }

    @GetMapping("/movies/now-playing")
    public ResponseDto<MovieDto> nowPlaying(@RequestParam(defaultValue = "1") int page) {
        return newHotService.nowPlayingMovies(page);
    }

    @GetMapping("/movies/upcoming")
    public ResponseDto<MovieDto> upcoming(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "US") String region
    ) {
        return newHotService.upcomingMoviesFuture(page, region);
    }

    @GetMapping("/tv/on-the-air")
    public ResponseDto<TvDto> onTheAir(@RequestParam(defaultValue = "1") int page) {
        return newHotService.onTheAirTv(page);
    }
}