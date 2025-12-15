package com.example.CineMatch.controller;

import com.example.CineMatch.dto.UserMediaDto;
import com.example.CineMatch.service.MediaService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserMediaDto> upload(
            @RequestParam UUID userId,
            @RequestPart MultipartFile file
    ) {
        return ResponseEntity.ok(mediaService.upload(userId, file));
    }
}
