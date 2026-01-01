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