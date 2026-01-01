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
 */package com.example.CineMatch.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PersonDetailsDto {
    private Long id;
    private String gender;
    private String name;
    private String biography;

    @JsonProperty("birthday")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private String birthday; // yyyy-MM-dd

    @JsonProperty("deathday")
    private String deathday;

    @JsonProperty("place_of_birth")
    private String placeOfBirth;

    @JsonProperty("profile_path")
    private String profilePath;

    @JsonProperty("known_for_department")
    private String knownForDepartment;

    @JsonProperty("homepage")
    private String homepage;

    @JsonProperty("popularity")
    private Double popularity;

    @JsonProperty("movie_credits")
    private List<MovieDto> movieCredits;
}
