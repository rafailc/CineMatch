package com.example.CineMatch.controller;

import com.example.CineMatch.dto.MovieDTO;
import com.example.CineMatch.service.MovieService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MovieControllerTest {

    @Mock
    private MovieService movieService;

    @InjectMocks
    private MovieController movieController;

    private List<MovieDTO> mockMovies;

    @BeforeEach
    void setUp() {
        mockMovies = Arrays.asList(
                new MovieDTO("550", "Movie 1", "/poster1.jpg", "Overview 1", 8.5,
                        Arrays.asList("Action"), LocalDate.now()),
                new MovieDTO("680", "Movie 2", "/poster2.jpg", "Overview 2", 7.8,
                        Arrays.asList("Drama"), LocalDate.now())
        );
    }

    @Test
    void getTrendingMovies_ShouldReturnOkWithMovies() {
        // Given
        when(movieService.getTrendingMovies()).thenReturn(mockMovies);

        // When
        ResponseEntity<List<MovieDTO>> response = movieController.getTrendingMovies();

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        verify(movieService, times(1)).getTrendingMovies();
    }

    @Test
    void getTrendingMovies_WhenServiceThrowsException_ShouldReturnInternalServerError() {
        // Given
        when(movieService.getTrendingMovies()).thenThrow(new RuntimeException("Database error"));

        // When
        ResponseEntity<List<MovieDTO>> response = movieController.getTrendingMovies();

        // Then
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNull(response.getBody());
    }
}