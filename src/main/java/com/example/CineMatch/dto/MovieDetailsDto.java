package com.example.CineMatch.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MovieDetailsDto {
    private Long id;
    private String title;
    private String overview;
    private Integer runtime;
    private String popularity;
    private String revenue;

    @JsonProperty("poster_path")
    private String posterPath;

    @JsonProperty("backdrop_path")
    private String backdropPath;

    @JsonProperty("vote_average")
    private Double voteAverage;

    @JsonProperty("release_date")
    private String releaseDate;

    private List<GenreDto> genres;
    private List<ProductionCompanyDto> productionCompanies;
    private List<SpokenLanguageDto> spokenLanguages;
    private List<PersonDto> cast;
}
