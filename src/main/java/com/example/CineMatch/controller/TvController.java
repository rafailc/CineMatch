package com.example.CineMatch.controller;

import com.example.CineMatch.dto.ResponseDto;
import com.example.CineMatch.dto.TvDetailsDto;
import com.example.CineMatch.dto.TvDto;
import com.example.CineMatch.service.TvService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tmdb")
public class TvController {

    private final TvService tvService;

    @Autowired
    public TvController(TvService tvService) {
        this.tvService = tvService;
    }

    /* Trending */
    @GetMapping("/trending/tv")
    public ResponseDto<TvDto> getTrendingTv(@RequestParam(defaultValue = "1") int page) {
        return tvService.getTrending(page);
    }

    /* Search */
    @GetMapping("/search/tv")
    public ResponseDto<TvDto> searchTV(@RequestParam String q, @RequestParam(defaultValue = "1") int page) {
        return tvService.getSearch(q, page);
    }

    /* Discover */
    @GetMapping("/discover/tv")
    public ResponseDto<TvDto> discoverTV(@RequestParam Map<String, String> params) {
        StringBuilder query = new StringBuilder("?");
        params.forEach((key, value) -> {
            query.append(key).append("=").append(value).append("&");
        });
        return tvService.getDiscover(query.toString());
    }

    /* Details */
    @GetMapping("/series/{id}")
    public TvDetailsDto seriesDetails(@PathVariable long id) {
        return tvService.getDetails(id);
    }
}