package com.example.CineMatch.controller;

import com.example.CineMatch.service.TmdbService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

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

    /* Image Proxy for AI Analysis */
    @GetMapping("/image")
    public ResponseEntity<byte[]> proxyImage(@RequestParam String path) {
        // Construct the URL to TMDB
        // Ensure the path has a leading slash if missing (though your frontend handles this too)
        String cleanPath = path.startsWith("/") ? path : "/" + path;
        String tmdbUrl = "https://image.tmdb.org/t/p/w500" + cleanPath;

        // Fetch the image
        RestTemplate restTemplate = new RestTemplate();
        byte[] imageBytes = restTemplate.getForObject(tmdbUrl, byte[].class);

        // Return the image bytes with the correct content type
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(imageBytes);
    }
}