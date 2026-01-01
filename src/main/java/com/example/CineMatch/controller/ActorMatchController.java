/*
 * CineMatch
 * Copyright (C) 2025 <Make a Wish team>
 * Authors: see AUTHORS.md
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed WITHOUT ANY WARRANTY.
 * See the GNU General Public License for more details.
 *
 * If not, see <https://www.gnu.org/licenses/>.
 */package com.example.CineMatch.controller;

import com.example.CineMatch.model.ActorMatchResponse;
import com.example.CineMatch.service.ActorMatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/actormatch")
public class ActorMatchController {

    private final ActorMatchService actorMatchService;

    @Autowired
    public ActorMatchController(ActorMatchService actorMatchService) {
        this.actorMatchService = actorMatchService;
    }

    @PostMapping(value = "/find", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ActorMatchResponse> findActorMatch(@RequestParam("photo") MultipartFile photo) {

        // 1. Input Control
        if (photo.isEmpty() || photo.getSize() == 0) {
            return ResponseEntity.badRequest().body(new ActorMatchResponse("Error", 0, "Please upload a photo."));
        }

        try {
            // 2. Service Call
            ActorMatchResponse matchResponse = actorMatchService.findAndResolveMatch(photo);

            // 3. Return POJO
            return ResponseEntity.ok(matchResponse);

        } catch (RuntimeException e) {
            // API Error Handling
            return ResponseEntity.status(500).body(new ActorMatchResponse("API Error", 0, "Error: " + e.getMessage()));
        } catch (Exception e) {
            // General Error
            return ResponseEntity.status(500).body(new ActorMatchResponse("Internal Error", 0, "Unexpected error: " + e.getMessage()));
        }
    }
}