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

// Single Tmdb Result
public class TmdbPersonResult {
    private String profile_path; //
    private String name;

    public TmdbPersonResult() {}

    public String getProfile_path() { return profile_path; }
    public void setProfile_path(String profile_path) { this.profile_path = profile_path; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}