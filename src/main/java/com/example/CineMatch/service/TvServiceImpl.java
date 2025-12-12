package com.example.CineMatch.service;

import com.example.CineMatch.Repository.TmdbRepository;
import com.example.CineMatch.dto.ResponseDto;
import com.example.CineMatch.dto.TvDetailsDto;
import com.example.CineMatch.dto.TvDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
public class TvServiceImpl implements TvService {

    private final TmdbRepository tmdbRepository;
    private final ObjectMapper objectMapper;

    @Autowired
     public TvServiceImpl(TmdbRepository tmdbRepository, ObjectMapper objectMapper) {
        this.tmdbRepository = tmdbRepository;
        this.objectMapper = objectMapper;
    }

    // TRENDING
    @Override
    public ResponseDto<TvDto> getTrending(int page) {
        String json = tmdbRepository.call("/trending/tv/week?page=" + page);
        ResponseDto<TvDto> response = objectMapper.readValue(json, ResponseDto.class);
        return response;
    }

    // SEARCH
    public ResponseDto<TvDto> getSearch(String q, int page) {
        String json = tmdbRepository.call("/search/tv?query=" + q + "&page=" + page);
        ResponseDto<TvDto> response = objectMapper.readValue(json, ResponseDto.class);
        return response;
    }

    // DISCOVER
    public ResponseDto<TvDto> getDiscover(String q) {
        Map<String,Object> map = tmdbRepository.callMap("/discover/tv" + q);
        String json = objectMapper.writeValueAsString(map);
        ResponseDto<TvDto> response = objectMapper.readValue(json, ResponseDto.class);
        return response;
    }

    // DETAILS
    public TvDetailsDto getDetails(long id) {
        Map<String, Object> details = tmdbRepository.callMap("/tv/" + id);
        Map<String, Object> credits = tmdbRepository.callMap("/tv/" + id + "/credits");
        details.put("cast", credits.get("cast"));
        String json = objectMapper.writeValueAsString(details);
        TvDetailsDto dto = objectMapper.readValue(json, TvDetailsDto.class);
        return dto;
    }
}