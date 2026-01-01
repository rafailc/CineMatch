/*
 * CineMatch
 * Copyright (C) 2025 <Make a Wish team>
 * Authors: see AUTHORS.md
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed WITHOUT ANY WARRANTY.
 * See the GNU General Public License for more details.
 *
 * If not, see <https://www.gnu.org/licenses/>.
 */package com.example.CineMatch.service;

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
