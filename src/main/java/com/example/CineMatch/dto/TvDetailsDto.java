package com.example.CineMatch.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TvDetailsDto {
    public Long id;
    public String name;
    public String original_name;
    public String overview;
    public String first_air_date;
    public String last_air_date;
    public Long number_of_episodes;
    public Long number_of_seasons;
    public Double vote_average;
    public Double vote_count;
    public Double popularity;
    public String status;
    public String type;
    public String homepage;
    public String backdrop_path;
    public String poster_path;

    public List<GenreDto> genres;
    public List<ProductionCompanyDto> production_companies;
    public List<SpokenLanguageDto> spoken_languages;
    public List<TvSeasonsDto> seasons;
    private List<PersonDto> cast;
}
