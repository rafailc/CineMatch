package com.example.CineMatch.service;

import com.example.CineMatch.Repository.TmdbRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class TvServiceImpl implements TvService {

    private final TmdbRepository tmdbRepository;

    @Autowired
     public TvServiceImpl(TmdbRepository tmdbRepository) {
        this.tmdbRepository = tmdbRepository;
    }

    // TRENDING
    @Override
    public String getTrending(int page) {
        return tmdbRepository.call("/trending/tv/week?page=" + page);
    }

    // SEARCH
    public String getSearch(String q, int page) {
        return tmdbRepository.call("/search/tv?query=" + q + "&page=" + page);
    }

    // DISCOVER
    public Map<String, Object> getDiscover(String q) {
        return tmdbRepository.callMap("/discover/tv" + q);
    }

    // DETAILS
    public Map<String, Object> getDetails(long id) {
        Map<String, Object> details = tmdbRepository.callMap("/tv/" + id);
        Map<String, Object> credits = tmdbRepository.callMap("/tv/" + id + "/credits");
        details.put("credits", credits);
        return details;
    }
}