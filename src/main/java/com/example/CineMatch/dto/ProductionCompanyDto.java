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
public class ProductionCompanyDto {
    private Long id;
    private String name;

    @JsonProperty("logo_path")
    private String logoPath;

    @JsonProperty("origin_country")
    private String originCountry;
}
