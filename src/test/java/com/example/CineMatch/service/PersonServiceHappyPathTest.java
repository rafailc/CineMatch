package com.example.CineMatch.service;

import com.example.CineMatch.Repository.TmdbRepository;
import com.example.CineMatch.dto.*;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PersonServiceHappyPathTest {

    @Mock
    TmdbRepository tmdbRepository;

    @Spy
    ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    PersonServiceImpl personService;

    @Test
    void getTrending_shouldReturnMappedPersons() throws Exception {
        String json = """
            {
              "results": [
                {
                  "id": 123,
                  "name": "Bob",
                  "known_for_department": "Acting",
                  "profile_path": "Links"
                }
              ]
            }
            """;

        when(tmdbRepository.call("/trending/person/week?page=1")).thenReturn(json);

        ResponseDto<PersonDto> response = personService.getTrending(1);

        assertNotNull(response);
        assertEquals(1, response.getResults().size());

        PersonDto person = response.getResults().getFirst();
        assertEquals(123, person.getId());
        assertEquals("Bob", person.getName());
        assertEquals("Acting", person.getKnownForDepartment());
        assertEquals("Links", person.getProfilePath());
    }

    @Test
    void getSearch_shouldReturnMappedPersons() throws Exception {
        String json = """
            {
              "results": [
                {
                  "id": 123,
                  "name": "Bobby",
                  "known_for_department": "Acting",
                  "profile_path": "Links"
                }
              ]
            }
            """;

        when(tmdbRepository.call("/search/person?query=Bob&page=1"))
                .thenReturn(json);

        ResponseDto<PersonDto> response = personService.getSearch("Bob", 1);

        assertNotNull(response);
        assertEquals(1, response.getResults().size());

        PersonDto person = response.getResults().getFirst();
        assertEquals("Bobby", person.getName());
    }

    @Test
    void getDetails_shouldReturnPersonWithMovieCredits() throws Exception {
        long personId = 125L;

        Map<String, Object> personDetails = Map.of(
                "id", 125L,
                "name", "Bob",
                "known_for_department", "Acting",
                "birthday", "1999-12-19",
                "profile_path", "/profile.jpg",
                "popularity", 9.0
        );

        Map<String, Object> movieCredits = Map.of(
                "cast", List.of(
                        Map.of("id", 3L, "title", "The Rise of Bob")
                )
        );

        when(tmdbRepository.callMap("/person/" + personId))
                .thenReturn(personDetails);
        when(tmdbRepository.callMap("/person/" + personId + "/movie_credits"))
                .thenReturn(movieCredits);

        PersonDetailsDto result = personService.getDetails(personId);

        assertNotNull(result);
        assertEquals(125L, result.getId());
        assertEquals("Bob", result.getName());
        assertEquals(1, result.getMovieCredits().size());
        assertEquals("The Rise of Bob", result.getMovieCredits().getFirst().getTitle());
    }
}
