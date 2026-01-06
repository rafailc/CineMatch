package com.example.CineMatch.service;

import com.example.CineMatch.dto.MovieDto;
import com.example.CineMatch.dto.ResponseDto;
import com.example.CineMatch.dto.TvDto;

public interface NewHotService {
    ResponseDto<MovieDto> nowPlayingMovies(int page);
    ResponseDto<MovieDto> upcomingMoviesFuture(int page, String region);
    ResponseDto<TvDto> onTheAirTv(int page);
}