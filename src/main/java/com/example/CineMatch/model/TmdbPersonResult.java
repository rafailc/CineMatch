package com.example.CineMatch.model;

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