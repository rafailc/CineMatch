package com.example.CineMatch.dto;

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
public class PersonDto {
    private Long id;
    private String name;

    @JsonProperty("cast_id")
    private Integer castId;

    @JsonProperty("profile_path")
    private String profilePath;

    @JsonProperty("known_for_department")
    private String knownForDepartment;

    @JsonProperty("known_for")
    private List<MovieDto> knownFor;

    // For Movie Detail Casts
    @JsonProperty("character")
    private String character;
    private Integer order;
}
