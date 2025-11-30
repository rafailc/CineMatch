package com.example.CineMatch.controller;

import com.example.CineMatch.service.TmdbService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tmdb")
public class TvController {

    private final TmdbService tmdbService;

    @Autowired
    public TvController(@Qualifier("tvServiceImpl") TmdbService tmdbService) {
        this.tmdbService = tmdbService;
    }

    /* Trending */
    @GetMapping("/trending/tv")
    public Object getTrendingTv(@RequestParam(defaultValue = "1") int page) {
        return tmdbService.getTrending(page);
    }

    /* Search */
    @GetMapping("/search/tv")
    public Object searchTV(@RequestParam String q, @RequestParam(defaultValue = "1") int page) {
        return tmdbService.getSearch(q, page);
    }

    /* Discover */
    @GetMapping("/discover/tv")
    public Object discoverTV(@RequestParam Map<String, String> params) {
        StringBuilder query = new StringBuilder("?");
        params.forEach((key, value) -> {
            query.append(key).append("=").append(value).append("&");
        });
        return tmdbService.getDiscover(query.toString());
    }

    /* Details */
    @GetMapping("/series/{id}")
    public Object seriesDetails(@PathVariable long id) {
        return tmdbService.getDetails(id);
    }
}