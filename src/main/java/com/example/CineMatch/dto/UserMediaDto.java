package com.example.CineMatch.dto;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "user_media")
public class UserMediaDto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType;

    @Column(nullable = false)
    private String mimeType;

    private Integer durationSeconds;

    @Column(nullable = false)
    private String storagePath;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
