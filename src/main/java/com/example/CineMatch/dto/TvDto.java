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
public class TvDto {
    public int id;
    public String name;
    public String original_name;
    public String overview;
    public String first_air_date;
    public String poster_path;
    public String backdrop_path;
    public double popularity;
    public double vote_average;
    public int vote_count;
    public String original_language;
    public List<Integer> genre_ids;
}
