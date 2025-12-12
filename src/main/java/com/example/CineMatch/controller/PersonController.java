package com.example.CineMatch.controller;

import com.example.CineMatch.dto.PersonDetailsDto;
import com.example.CineMatch.dto.PersonDto;
import com.example.CineMatch.dto.ResponseDto;
import com.example.CineMatch.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/tmdb")
public class PersonController {

    private final PersonService personService;

    @Autowired
    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    /* Trending */
    @GetMapping("/trending/person")
    public ResponseDto<PersonDto> getTrendingPerson(@RequestParam(defaultValue = "1") int page) {
        return personService.getTrending(page);
    }

    /* Search */
    @GetMapping("/search/people")
    public ResponseDto<PersonDto> searchPeople(@RequestParam String q, @RequestParam(defaultValue = "1") int page) {
        return personService.getSearch(q, page);
    }

    /* Details */
    @GetMapping("/person/{id}")
    public PersonDetailsDto personDetails(@PathVariable long id) {
        return personService.getDetails(id);
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