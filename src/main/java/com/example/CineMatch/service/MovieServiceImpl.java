package com.example.CineMatch.service;

import com.example.CineMatch.Repository.TmdbRepository;
import com.example.CineMatch.dto.MovieDetailsDto;
import com.example.CineMatch.dto.MovieDto;
import com.example.CineMatch.dto.ResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
public class MovieServiceImpl implements MovieService {

    private final TmdbRepository tmdbRepository;
    private final ObjectMapper objectMapper;

    @Autowired
     public MovieServiceImpl(TmdbRepository tmdbRepository, ObjectMapper objectMapper) {
        this.tmdbRepository = tmdbRepository;
        this.objectMapper = objectMapper;
    }

    // TRENDING
    @Override
    public ResponseDto<MovieDto> getTrending(int page) {
        String json = tmdbRepository.call("/trending/movie/week?page=" + page);
        ResponseDto<MovieDto> response = objectMapper.readValue(json, ResponseDto.class);
        return response;
    }

    // SEARCH
    @Override
    public ResponseDto<MovieDto> getSearch(String q, int page) {
        String json = tmdbRepository.call("/search/movie?query=" + q + "&page=" + page);
        ResponseDto<MovieDto> response = objectMapper.readValue(json, ResponseDto.class);
        return response;
    }

    // DISCOVER
    @Override
    public ResponseDto<MovieDto> getDiscover(String q) {
        Map<String,Object> map = tmdbRepository.callMap("/discover/movie" + q);
        String json = objectMapper.writeValueAsString(map);
        ResponseDto<MovieDto> response = objectMapper.readValue(json, ResponseDto.class);
        return response;
    }

    // DETAILS
    @Override
    public MovieDetailsDto getDetails(long id) {
        Map<String, Object> details = tmdbRepository.callMap("/movie/" + id);
        Map<String, Object> credits = tmdbRepository.callMap("/movie/" + id + "/credits");
        details.put("cast", credits.get("cast"));
        String json = objectMapper.writeValueAsString(details);
        MovieDetailsDto dto = objectMapper.readValue(json, MovieDetailsDto.class);
        return dto;
    }
}