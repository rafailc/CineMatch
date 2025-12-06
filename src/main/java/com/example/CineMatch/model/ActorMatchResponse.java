package com.example.CineMatch.model;


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