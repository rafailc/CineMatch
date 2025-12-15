package com.example.CineMatch.Repository;

import com.example.CineMatch.dto.UserMediaDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface UserMediaRepository
        extends JpaRepository<UserMediaDto, UUID> {
}
