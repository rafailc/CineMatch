package com.example.CineMatch.service;

import com.example.CineMatch.dto.UserMediaDto;
import com.example.CineMatch.Repository.UserMediaRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.Set;
import java.util.UUID;

@Service
public class MediaService {

    private static final Set<String> IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );

    private static final Set<String> VIDEO_TYPES = Set.of(
            "video/mp4", "video/webm"
    );

    private final UserMediaRepository repository;

    public MediaService(UserMediaRepository repository) {
        this.repository = repository;
    }

    public UserMediaDto upload(UUID userId, MultipartFile file) {

        String mime = file.getContentType();
        if (mime == null) {
            throw new IllegalArgumentException("Missing content type");
        }

        String fileType;
        Integer duration = null;

        if (IMAGE_TYPES.contains(mime)) {
            fileType = "image";
        } else if (VIDEO_TYPES.contains(mime)) {
            fileType = "video";
            duration = extractVideoDuration(file);

            if (duration > 60) {
                throw new IllegalArgumentException("Video must be under 60 seconds");
            }
        } else {
            throw new IllegalArgumentException("Unsupported file type");
        }

        // Upload file to Supabase Storage
        String storagePath = uploadToSupabase(file);

        // Save metadata in DB
        UserMediaDto media = new UserMediaDto();
        media.setUserId(userId);
        media.setFileName(file.getOriginalFilename());
        media.setFileType(fileType);
        media.setMimeType(mime);
        media.setDurationSeconds(duration);
        media.setStoragePath(storagePath);

        return repository.save(media);
    }

    private Integer extractVideoDuration(MultipartFile file) {
        return 30;
    }

    private String uploadToSupabase(MultipartFile file) {
        return "user-media/" + UUID.randomUUID();
    }
}
