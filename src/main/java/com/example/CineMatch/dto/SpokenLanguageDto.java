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
public class SpokenLanguageDto {
    @JsonProperty("english_name")
    private String englishName;

    @JsonProperty("iso_639_1")
    private String iso639;

    private String name;
}
