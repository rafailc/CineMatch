package com.example.CineMatch.service;

import com.example.CineMatch.dto.PersonDetailsDto;
import com.example.CineMatch.dto.PersonDto;
import com.example.CineMatch.dto.ResponseDto;

import java.util.Map;

public interface PersonService {
    ResponseDto<PersonDto> getTrending(int page);
    ResponseDto<PersonDto> getSearch(String q, int page);
    PersonDetailsDto getDetails(long id);
}
