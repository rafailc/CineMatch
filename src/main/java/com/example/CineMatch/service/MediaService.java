package com.example.CineMatch.service;

import com.example.CineMatch.dto.UserMediaDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface MediaService {
    UserMediaDto upload(UUID userId, MultipartFile file);
}
