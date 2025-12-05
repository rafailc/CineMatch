package com.example.CineMatch.model;

import java.util.List;

// Total TMDb Search Result
public class TmdbSearchResponse {
    private List<TmdbPersonResult> results;

    public TmdbSearchResponse() {}

    public List<TmdbPersonResult> getResults() { return results; }
    public void setResults(List<TmdbPersonResult> results) { this.results = results; }
}