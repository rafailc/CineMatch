package com.example.CineMatch.service;

import com.example.CineMatch.Repository.TmdbRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class PersonServiceImpl implements PersonService {

    private final TmdbRepository tmdbRepository;

    @Autowired
     public PersonServiceImpl(TmdbRepository tmdbRepository) {
        this.tmdbRepository = tmdbRepository;
    }

    // TRENDING
    @Override
    public String getTrending(int page) {
        return tmdbRepository.call("/trending/person/week?page=" + page);
    }

    // SEARCH
    @Override
    public String getSearch(String q, int page) {
        return tmdbRepository.call("/search/person?query=" + q + "&page=" + page);
    }

    // DETAILS
    @Override
    public Map<String, Object> getDetails(long id) {
        Map<String, Object> details = tmdbRepository.callMap("/person/" + id);
        Map<String, Object> credits = tmdbRepository.callMap("/person/" + id + "/movie_credits");
        details.put("movie_credits", credits);
        return details;
    }
}