package com.example.CineMatch.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAnswer {
    // Question's Index (0, 1, 2, 3, 4)
    private int questionIndex;

    // User's Choice (0, 1, 2, 3)
    private int selectedOptionIndex;
}