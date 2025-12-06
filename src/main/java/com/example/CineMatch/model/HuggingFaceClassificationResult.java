package com.example.CineMatch.model;


public class HuggingFaceClassificationResult {
    private String label; // Actor Name
    private float score; // Similarity

    // default constructor
    public HuggingFaceClassificationResult() {}

    // Getters Setters
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public float getScore() { return score; }
    public void setScore(float score) { this.score = score; }
}