package com.example.CineMatch.service;

import com.example.CineMatch.Repository.TmdbRepository;
import com.example.CineMatch.dto.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TvServiceImplTest {

    @Mock
    private TmdbRepository tmdbRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private TvServiceImpl tvService;

    @Nested
    @DisplayName("Happy Path Tests")
    class HappyPath {

        @Test
        @DisplayName("Should return trending TV shows correctly")
        void testGetTrending_Success() {
            String json = "{ \"results\": [{ \"id\": 123, \"name\": \"Dora the Explorer\", \"first_air_date\": \"1994-05-19\", \"vote_average\": 8.5 }] }";
            when(tmdbRepository.call(contains("/trending/tv/week"))).thenReturn(json);

            ResponseDto<TvDto> response = tvService.getTrending(1);

            assertNotNull(response);
            assertFalse(response.getResults().isEmpty());
            assertEquals(123, response.getResults().get(0).getId());
            assertEquals("Dora the Explorer", response.getResults().get(0).getName());
        }

        @Test
        @DisplayName("Should merge details and credits successfully")
        void testGetDetails_Success() throws Exception {
            long tvId = 125L;

            // Προσοχή: Χρησιμοποιούμε HashMap γιατί η υλοποίηση κάνει new HashMap
            Map<String, Object> tvDetails = new HashMap<>();
            tvDetails.put("id", 125L);
            tvDetails.put("name", "Dora the Explorer");
            tvDetails.put("number_of_seasons", 34);
            tvDetails.put("vote_average", 9.0);

            // Το "cast" ΠΡΕΠΕΙ να είναι List για να μην "σκάσει" ο ObjectMapper
            Map<String, Object> castMember = new HashMap<>();
            castMember.put("name", "Kathleen Herles");
            castMember.put("character", "Dora");

            Map<String, Object> movieCredits = new HashMap<>();
            movieCredits.put("cast", List.of(castMember));

            when(tmdbRepository.callMap(eq("/tv/" + tvId))).thenReturn(tvDetails);
            when(tmdbRepository.callMap(eq("/tv/" + tvId + "/credits"))).thenReturn(movieCredits);

            TvDetailsDto result = tvService.getDetails(tvId);

            assertNotNull(result);
            assertEquals(125L, result.getId());
            assertEquals("Dora the Explorer", result.getName());
            assertNotNull(result.getCast());
            assertEquals(1, result.getCast().size());
            assertEquals("Kathleen Herles", result.getCast().get(0).getName());
        }
    }

    @Nested
    @DisplayName("Edge Case & Robustness Tests")
    class EdgeCases {

        @Test
        @DisplayName("Should throw exception when TMDB sends invalid details (null name/id)")
        void testGetDetails_InvalidDataFromApi() throws Exception {
            Map<String, Object> invalidDetails = new HashMap<>();
            invalidDetails.put("id", null);

            when(tmdbRepository.callMap(anyString())).thenReturn(invalidDetails);

            assertThrows(RuntimeException.class, () -> tvService.getDetails(1L));
        }

        @Test
        @DisplayName("Should propagate RuntimeException if Repository fails")
        void testRepositoryFailure() {
            when(tmdbRepository.call(anyString())).thenThrow(new RuntimeException("TMDB Down"));

            Exception exception = assertThrows(RuntimeException.class, () -> tvService.getTrending(1));
            assertEquals("TMDB Down", exception.getMessage());
        }

        @ParameterizedTest
        @ValueSource(ints = {-1, 0, 9999})
        @DisplayName("Handle various page scenarios")
        void testVariousPages(int page) {
            String emptyJson = "{ \"results\": [] }";
            when(tmdbRepository.call(anyString())).thenReturn(emptyJson);

            ResponseDto<TvDto> response = tvService.getTrending(page);
            assertNotNull(response);
            assertTrue(response.getResults().isEmpty());
        }

        @Test
        @DisplayName("Should handle cases where cast is missing from API response")
        void testGetDetails_MissingCast() throws Exception {
            long id = 100L;
            Map<String, Object> details = new HashMap<>();
            details.put("id", 100L);
            details.put("name", "Mystery Show");

            Map<String, Object> credits = new HashMap<>();
            credits.put("cast", null); // Το API επιστρέφει null cast

            when(tmdbRepository.callMap(contains("/tv/100"))).thenReturn(details);
            when(tmdbRepository.callMap(contains("/credits"))).thenReturn(credits);

            TvDetailsDto result = tvService.getDetails(id);

            assertNotNull(result);
            assertNull(result.getCast()); // Ή empty list αν το DTO έχει default τιμή
        }
    }
}