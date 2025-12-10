package com.example.CineMatch.service;

import java.util.Map;

public interface TvService {
    String getTrending(int page);
    String getSearch(String q, int page);
    Map<String, Object> getDiscover(String q);
    Map<String, Object> getDetails(long id);
}