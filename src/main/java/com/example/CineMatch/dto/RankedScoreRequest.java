package com.example.CineMatch.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RankedScoreRequest {
    private int correct;
    private int wrong;
    private int timeTakenSeconds;
}
