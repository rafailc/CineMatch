package com.example.CineMatch.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TvSeasonsDto {
    public String air_date;
    public int episode_count;
    public int id;
    public String name;
    public String overview;
    public String poster_path;
    public int season_number;
}
