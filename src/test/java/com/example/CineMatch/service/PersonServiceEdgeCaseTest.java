package com.example.CineMatch.service;

import com.example.CineMatch.Repository.TmdbRepository;
import com.example.CineMatch.dto.PersonDetailsDto;
import com.example.CineMatch.dto.PersonDto;
import com.example.CineMatch.dto.ResponseDto;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PersonServiceEdgeCaseTest {

    @Mock
    TmdbRepository tmdbRepository;

    @Spy
    ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    PersonServiceImpl personService;

    @Test
    void methods_shouldPropagateException_whenRepositoryFails() {
        when(tmdbRepository.call(anyString()))
                .thenThrow(new RuntimeException("TMDB down"));
        when(tmdbRepository.callMap(anyString()))
                .thenThrow(new RuntimeException("TMDB down"));

        assertThrows(RuntimeException.class, () -> personService.getTrending(1));
        assertThrows(RuntimeException.class, () -> personService.getSearch("Query", 1));
        assertThrows(RuntimeException.class, () -> personService.getDetails(1));
    }

    @Test
    void methods_shouldThrowException_whenJsonIsInvalid() throws Exception {
        when(tmdbRepository.call(anyString()))
                .thenReturn("Invalid JSON");

        Map<String, Object> invalidMap = new HashMap<>();
        invalidMap.put("invalid", "data");

        when(tmdbRepository.callMap(anyString()))
                .thenReturn(invalidMap);

        assertThrows(RuntimeException.class, () -> personService.getTrending(1));
        assertThrows(RuntimeException.class, () -> personService.getSearch("Query", 1));
        assertThrows(RuntimeException.class, () -> personService.getDetails(1));
    }

    @Test
    void getMethods_shouldReturnNullResults_whenNoResultsField() throws Exception {
        when(tmdbRepository.call(anyString())).thenReturn("{}");

        ResponseDto<PersonDto> trending = personService.getTrending(1);
        ResponseDto<PersonDto> search = personService.getSearch("Query", 1);

        assertNotNull(trending);
        assertNotNull(search);
        assertNull(trending.getResults());
        assertNull(search.getResults());
    }

    @ParameterizedTest
    @ValueSource(ints = {-1, 0})
    void getMethods_shouldHandleInvalidPages(int page) throws Exception {
        when(tmdbRepository.call(anyString()))
                .thenThrow(new IllegalArgumentException("Invalid page"));

        assertThrows(IllegalArgumentException.class,
                () -> personService.getTrending(page));
        assertThrows(IllegalArgumentException.class,
                () -> personService.getSearch("Query", page));
    }

    @Test
    void getDetails_shouldHandleMissingCastGracefully() throws Exception {
        long id = 1L;

        Map<String, Object> details = Map.of(
                "id", 5L,
                "name", "Bob"
        );

        Map<String, Object> credits = new HashMap<>();
        credits.put("cast", null); // Map.of() cannot be used here

        when(tmdbRepository.callMap("/person/" + id)).thenReturn(details);
        when(tmdbRepository.callMap("/person/" + id + "/movie_credits"))
                .thenReturn(credits);

        PersonDetailsDto result = personService.getDetails(id);

        assertNotNull(result);
        assertNull(result.getMovieCredits());
    }
}
