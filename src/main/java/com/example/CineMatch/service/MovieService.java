package com.example.CineMatch.service;

import com.example.CineMatch.dto.MovieDetailsDto;
import com.example.CineMatch.dto.MovieDto;
import com.example.CineMatch.dto.ResponseDto;

import java.util.Map;

public interface MovieService {
    ResponseDto<MovieDto> getTrending(int page);
    ResponseDto<MovieDto> getSearch(String q, int page);
    ResponseDto<MovieDto> getDiscover(String q);
    MovieDetailsDto getDetails(long id);
}
