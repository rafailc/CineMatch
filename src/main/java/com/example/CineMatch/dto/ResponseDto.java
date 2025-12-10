package com.example.CineMatch.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ResponseDto<T> {

    private int page;
    @JsonProperty("results")
    private List<T> results;
    private Long total_pages;
    private Long total_results;
}

