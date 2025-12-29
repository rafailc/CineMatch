package com.example.CineMatch.service;

import com.example.CineMatch.Repository.TmdbRepository;
import com.example.CineMatch.dto.MovieDetailsDto;
import com.example.CineMatch.dto.MovieDto;
import com.example.CineMatch.dto.ResponseDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MovieServiceEdgeCaseTest {

    @Mock
    TmdbRepository tmdbRepository;

    @Spy
    ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private MovieServiceImpl movieService;

    @Test
    void getMethods_shouldPropagateException_whenRepositoryFails() {
        when(tmdbRepository.call(anyString()))
                .thenThrow(new RuntimeException("TMDB down"));
        when(tmdbRepository.callMap(anyString()))
                .thenThrow(new RuntimeException("TMDB down"));

        RuntimeException trendEx = assertThrows(
                RuntimeException.class,
                () -> movieService.getTrending(1)
        );
        RuntimeException searchEx = assertThrows(
                RuntimeException.class,
                () -> movieService.getSearch("Query",1)
        );
        RuntimeException discoverEx = assertThrows(
                RuntimeException.class,
                () -> movieService.getDiscover("Query")
        );
        RuntimeException detailsEx = assertThrows(
                RuntimeException.class,
                () -> movieService.getDetails(1300)
        );

        assertEquals("TMDB down", trendEx.getMessage());
        assertEquals("TMDB down", searchEx.getMessage());
        assertEquals("TMDB down", discoverEx.getMessage());
        assertEquals("TMDB down", detailsEx.getMessage());
    }

    @Test
    void getMethods_shouldThrowException_whenJsonIsInvalid() throws Exception {
        String invalidJson = "Hello World";
        Map<String, Object> invalidMap = new HashMap<>();
        invalidMap.put("foreign_field", invalidJson);

        when(tmdbRepository.call(anyString()))
                .thenReturn(invalidJson);
        when(tmdbRepository.callMap(anyString()))
                .thenReturn(invalidMap);

        assertThrows(
                RuntimeException.class,
                () -> movieService.getTrending(1)
        );
        assertThrows(
                RuntimeException.class,
                () -> movieService.getSearch("Query",1)
        );
        assertThrows(
                RuntimeException.class,
                () -> movieService.getDiscover("Query")
        );
        assertThrows(
                RuntimeException.class,
                () -> movieService.getDetails(1328)
        );
    }

    @Test
    void getMethods_shouldReturnEmptyList_whenNoMoviesFound() throws Exception {
        String json = "{}";

        ResponseDto<MovieDto> response = new ResponseDto<>();
        response.setResults(List.of());

        when(tmdbRepository.call(anyString()))
                .thenReturn(json);

        List<ResponseDto<MovieDto>> results = new ArrayList<>();
        results.add(movieService.getTrending(1));
        results.add(movieService.getSearch("Search",1));
        results.add(movieService.getDiscover("Search"));

        for(ResponseDto<MovieDto> result : results) {
            assertNotNull(result);
            assertNull(result.getResults());
        }
    }

    @ParameterizedTest
    @ValueSource(ints = { -1, 0, Integer.MAX_VALUE })
    void getMethods_shouldHandleInvalidPages(int page) throws Exception {
        when(tmdbRepository.call(anyString()))
                .thenThrow(new IllegalArgumentException("Invalid page"));

        assertThrows(
                IllegalArgumentException.class,
                () -> movieService.getTrending(page)
        );
        assertThrows(
                IllegalArgumentException.class,
                () -> movieService.getSearch("Query",page)
        );
    }

    @Test
    void getDetails_shouldHandleMissingCastGracefully() throws Exception {
        long id = 1;

        Map<String, Object> details = new HashMap<>();
        details.put("id","5");
        details.put("title", "Movie");
        Map<String, Object> credits = new HashMap<>();
        credits.put("cast", null);

        when(tmdbRepository.callMap("/movie/" + id))
                .thenReturn(details);

        when(tmdbRepository.callMap("/movie/" + id + "/credits"))
                .thenReturn(credits);

        MovieDetailsDto result = movieService.getDetails(id);

        assertNotNull(result);
    }
}

