package com.example.CineMatch.service;

import com.example.CineMatch.Repository.TmdbRepository;
import com.example.CineMatch.dto.MovieDetailsDto;
import com.example.CineMatch.dto.PersonDetailsDto;
import com.example.CineMatch.dto.PersonDto;
import com.example.CineMatch.dto.ResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
public class PersonServiceImpl implements PersonService {

    private final TmdbRepository tmdbRepository;
    private final ObjectMapper objectMapper;

    @Autowired
     public PersonServiceImpl(TmdbRepository tmdbRepository, ObjectMapper objectMapper) {
        this.tmdbRepository = tmdbRepository;
        this.objectMapper = objectMapper;
    }

    // TRENDING
    @Override
    public ResponseDto<PersonDto> getTrending(int page) {
        String json = tmdbRepository.call("/trending/person/week?page=" + page);
        ResponseDto<PersonDto> response = objectMapper.readValue(json, ResponseDto.class);
        return response;
    }

    // SEARCH
    @Override
    public ResponseDto<PersonDto> getSearch(String q, int page) {
        String json = tmdbRepository.call("/search/person?query=" + q + "&page=" + page);
        ResponseDto<PersonDto> response = objectMapper.readValue(json, ResponseDto.class);
        return response;
    }

    // DETAILS
    @Override
    public PersonDetailsDto getDetails(long id) {
        Map<String, Object> details = tmdbRepository.callMap("/person/" + id);
        Map<String, Object> credits = tmdbRepository.callMap("/person/" + id + "/movie_credits");
        details.put("movie_credits", credits.get("cast"));
        String json = objectMapper.writeValueAsString(details);
        PersonDetailsDto dto = objectMapper.readValue(json, PersonDetailsDto.class);
        return dto;
    }
}