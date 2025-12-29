package com.example.CineMatch.service;

import com.example.CineMatch.model.ActorMatchResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ActorMatchService {
    ActorMatchResponse findAndResolveMatch(MultipartFile photo) throws Exception;
}
