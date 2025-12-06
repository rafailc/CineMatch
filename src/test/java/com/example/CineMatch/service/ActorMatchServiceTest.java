package com.example.CineMatch.service;

import com.example.CineMatch.model.ActorMatchResponse;
import com.example.CineMatch.model.HuggingFaceClassificationResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy; // ΑΠΑΡΑΙΤΗΤΟ
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

// Δεν χρειάζεται το @MockitoSettings(strictness = Strictness.LENIENT)
// αφού αποφεύγουμε τα περιττά stubs
@ExtendWith(MockitoExtension.class)
public class ActorMatchServiceTest {

    // 🚨 ΔΙΟΡΘΩΣΗ: Κάνουμε SPY στον Service για να μπορούμε να Mock τις public μεθόδους του
    @InjectMocks
    @Spy
    private ActorMatchService actorMatchService;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private MultipartFile mockPhoto;

    // Test Data: Δημιουργούμε τα POJO objects απευθείας
    private List<HuggingFaceClassificationResult> mockHfSuccessList;


    @BeforeEach
    void setUp() {
        // 1. ΔΙΟΡΘΩΣΗ: Injection των @Value πεδίων για το test
        ReflectionTestUtils.setField(actorMatchService, "huggingfaceApiKey", "MOCK_HF_KEY");
        ReflectionTestUtils.setField(actorMatchService, "tmdbApiKey", "MOCK_TMDB_KEY");

        // 2. Δημιουργία mock POJO για το Hugging Face
        HuggingFaceClassificationResult hfResult = new HuggingFaceClassificationResult();
        hfResult.setLabel("Tom Hanks");
        hfResult.setScore(0.99f);
        mockHfSuccessList = Collections.singletonList(hfResult);
    }

    // --- 1. SUCCESS TEST: Όλα λειτουργούν σωστά ---
    @Test
    void findAndResolveMatch_Success() throws Exception {

        // 1. Mocking της μεθόδου callHuggingFaceApi
        // ΔΙΟΡΘΩΣΗ: Χρησιμοποιούμε doReturn().when() για να κάνουμε Mock την public μέθοδο.
        doReturn(mockHfSuccessList)
                .when(actorMatchService)
                .callHuggingFaceApi(any(MultipartFile.class));

        // 2. Mocking της μεθόδου searchTmdbForImageUrl
        doReturn("https://image.tmdb.org/t/p/w500/tmnb_path.jpg")
                .when(actorMatchService)
                .searchTmdbForImageUrl(eq("Tom Hanks"));

        // 3. Εκτέλεση
        ActorMatchResponse response = actorMatchService.findAndResolveMatch(mockPhoto);

        // 4. Επιβεβαίωση Αποτελέσματος
        assertNotNull(response);
        assertEquals("Tom Hanks", response.getMatchedActorName());
        assertEquals(0.99f, response.getSimilarityScore(), 0.001);
        assertTrue(response.getActorImageUrl().contains("tmnb_path.jpg"));

        // 5. Επιβεβαίωση συμπεριφοράς
        verify(actorMatchService, times(1)).callHuggingFaceApi(any());
        verify(actorMatchService, times(1)).searchTmdbForImageUrl(eq("Tom Hanks"));
    }

    // --- 2. FAILURE TEST: Όταν αποτυγχάνει η κλήση στο Hugging Face ---
    @Test
    void findAndResolveMatch_HfApiFailureThrowsException() throws Exception {

        // OVERRIDE: Ρυθμίζουμε το Spy να πετάξει εξαίρεση κατά την κλήση
        doThrow(new RuntimeException("Simulated API Connection Error"))
                .when(actorMatchService)
                .callHuggingFaceApi(any(MultipartFile.class));

        // Επιβεβαιώνουμε ότι πετάγεται RuntimeException
        assertThrows(RuntimeException.class, () -> {
            actorMatchService.findAndResolveMatch(mockPhoto);
        });

        // Επιβεβαιώνουμε ότι η κλήση στο TMDb ΔΕΝ έγινε
        verify(actorMatchService, never()).searchTmdbForImageUrl(anyString());
    }

    // --- 3. EDGE CASE TEST: Όταν το TMDb δεν βρίσκει εικόνα ---
    @Test
    void findAndResolveMatch_TmdbNoImageUrl() throws Exception {

        // 1. Mocking της μεθόδου callHuggingFaceApi (Επιτυχία)
        doReturn(mockHfSuccessList)
                .when(actorMatchService)
                .callHuggingFaceApi(any(MultipartFile.class));

        // 2. Mocking της μεθόδου searchTmdbForImageUrl (Αποτυχία: Επιστρέφει null)
        doReturn(null)
                .when(actorMatchService)
                .searchTmdbForImageUrl(anyString());

        // 3. Εκτέλεση
        ActorMatchResponse response = actorMatchService.findAndResolveMatch(mockPhoto);

        // 4. Επιβεβαίωση
        assertNull(response.getActorImageUrl());
        assertEquals("Tom Hanks", response.getMatchedActorName());

        verify(actorMatchService, times(1)).callHuggingFaceApi(any());
        verify(actorMatchService, times(1)).searchTmdbForImageUrl(anyString());
    }
}