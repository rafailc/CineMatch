package com.example.CineMatch.Repository;


import com.example.CineMatch.dto.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, UUID> {

    // Βρίσκουμε τις προτιμήσεις βάσει του user_id
    Optional<UserPreference> findByUserId(UUID userId);
}