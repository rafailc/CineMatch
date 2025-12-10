package com.example.CineMatch.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CastDto {
    private Long id;
    private String name;

    @JsonProperty("cast_id")
    private Integer castId;

    @JsonProperty("character")
    private String character;

    @JsonProperty("profile_path")
    private String profilePath;

    private Integer order;
}
