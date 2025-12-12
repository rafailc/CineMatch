package com.example.CineMatch.service;

import com.example.CineMatch.dto.ResponseDto;
import com.example.CineMatch.dto.TvDetailsDto;
import com.example.CineMatch.dto.TvDto;

import java.util.Map;

public interface TvService {
    ResponseDto<TvDto> getTrending(int page);
    ResponseDto<TvDto> getSearch(String q, int page);
    ResponseDto<TvDto> getDiscover(String q);
    TvDetailsDto getDetails(long id);
}