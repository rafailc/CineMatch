package com.example.CineMatch.service;
import com.example.CineMatch.Repository.TmdbRepository;
import com.example.CineMatch.dto.MovieDetailsDto;
import com.example.CineMatch.dto.MovieDto;
import com.example.CineMatch.dto.ResponseDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MovieServiceHappyPathTest {

    @Mock
    TmdbRepository tmdbRepository;

    @Spy
    ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private MovieServiceImpl movieService;

    @Test
    void testGetTrending() throws Exception {
        String json = "{ \"results\": [{ \"id\": 123, \"title\": \"Batman\", \"release_date\": \"2023-10-01\", \"vote_average\": 7.5 }] }";
        when(tmdbRepository.call("/trending/movie/week?page=1")).thenReturn(json);

        ResponseDto<MovieDto> response = movieService.getTrending(1);

        assertNotNull(response);
        assertEquals(1, response.getResults().size());

        MovieDto movie = response.getResults().getFirst();
        assertEquals(123, movie.getId());
        assertEquals("Batman", movie.getTitle());
        assertEquals("2023-10-01", movie.getReleaseDate());
        assertEquals(7.5, movie.getVoteAverage());
    }

    @Test
    void testGetSearch() throws Exception {
        String query = "Batman";
        int page = 1;
        String json = "{ \"results\": [{ \"id\": 124, \"title\": \"Batman Begins\", \"release_date\": \"2005-06-15\", \"vote_average\": 8.3 }] }";
        when(tmdbRepository.call("/search/movie?query=" + query + "&page=" + page)).thenReturn(json);

        ResponseDto<MovieDto> response = movieService.getSearch(query, page);

        assertNotNull(response);
        assertEquals(1, response.getResults().size());

        MovieDto movie = response.getResults().getFirst();
        assertEquals(124, movie.getId());
        assertEquals("Batman Begins", movie.getTitle());
        assertEquals("2005-06-15", movie.getReleaseDate());
        assertEquals(8.3, movie.getVoteAverage());
    }

    @Test
    void testGetDiscover() throws Exception {
        String query = "?with_genres=28";
        String json = "{ \"results\": [{ \"id\": 125, \"title\": \"The Dark Knight\", \"release_date\": \"2008-07-18\", \"vote_average\": 9.0 }] }";
        when(tmdbRepository.call("/discover/movie" + query)).thenReturn(json);

        ResponseDto<MovieDto> response = movieService.getDiscover(query);

        assertNotNull(response);
        assertEquals(1, response.getResults().size());

        MovieDto movie = response.getResults().getFirst();
        assertEquals(125, movie.getId());
        assertEquals("The Dark Knight", movie.getTitle());
        assertEquals("2008-07-18", movie.getReleaseDate());
        assertEquals(9.0, movie.getVoteAverage());
    }

    @Test
    void testGetDetails() throws Exception {
        long movieId = 125L;
        Map<String, Object> movieDetails = Map.of(
                "id", 125L,
                "title", "The Dark Knight",
                "overview", "The second installment in the Batman trilogy.",
                "runtime", 152,
                "popularity", "high",
                "revenue", "1,000,000,000",
                "poster_path", "/path/to/poster.jpg",
                "backdrop_path", "/path/to/backdrop.jpg",
                "vote_average", 9.0,
                "release_date", "2008-07-18"
        );

        Map<String, Object> movieCredits = Map.of(
                "cast", List.of(
                        Map.of("name", "Christian Bale", "character", "Bruce Wayne")
                )
        );

        when(tmdbRepository.callMap("/movie/" + movieId)).thenReturn(movieDetails);
        when(tmdbRepository.callMap("/movie/" + movieId + "/credits")).thenReturn(movieCredits);

        MovieDetailsDto movieDetailsDto = movieService.getDetails(movieId);

        assertNotNull(movieDetailsDto);
        assertEquals(125L, movieDetailsDto.getId());
        assertEquals("The Dark Knight", movieDetailsDto.getTitle());
        assertEquals("2008-07-18", movieDetailsDto.getReleaseDate());
        assertEquals(152, movieDetailsDto.getRuntime());
        assertEquals(9.0, movieDetailsDto.getVoteAverage());
        assertNotNull(movieDetailsDto.getCast());
        assertEquals(1, movieDetailsDto.getCast().size());
        assertEquals("Christian Bale", movieDetailsDto.getCast().getFirst().getName());
        assertEquals("Bruce Wayne", movieDetailsDto.getCast().getFirst().getCharacter());
    }
}

