package com.example.CineMatch.controller;

import com.example.CineMatch.service.TmdbService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tmdb")
public class PersonController {

    private final TmdbService tmdbService;

    @Autowired
    public PersonController(@Qualifier("personServiceImpl") TmdbService tmdbService) {
        this.tmdbService = tmdbService;
    }

    /* Trending */
    @GetMapping("/trending/person")
    public Object getTrendingPerson(@RequestParam(defaultValue = "1") int page) {
        return tmdbService.getTrending(page);
    }

    /* Search */
    @GetMapping("/search/people")
    public Object searchPeople(@RequestParam String q, @RequestParam(defaultValue = "1") int page) {
        return tmdbService.getSearch(q, page);
    }

    /* Details */
    @GetMapping("/person/{id}")
    public Object personDetails(@PathVariable long id) {
        return tmdbService.getDetails(id);
    }
}