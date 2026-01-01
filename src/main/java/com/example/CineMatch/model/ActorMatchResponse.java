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
 */package com.example.CineMatch.model;


public class ActorMatchResponse {
    private String matchedActorName;
    private float similarityScore;
    private String actorImageUrl;

    // Constructor
    public ActorMatchResponse(String name, float score, String imageUrl) {
        this.matchedActorName = name;
        this.similarityScore = score;
        this.actorImageUrl = imageUrl;
    }

    // Default constructor
    public ActorMatchResponse() {}

    // Getters Setters
    public String getMatchedActorName() { return matchedActorName; }
    public void setMatchedActorName(String matchedActorName) { this.matchedActorName = matchedActorName; }
    public float getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(float similarityScore) { this.similarityScore = similarityScore; }
    public String getActorImageUrl() { return actorImageUrl; }
    public void setActorImageUrl(String actorImageUrl) { this.actorImageUrl = actorImageUrl; }
}