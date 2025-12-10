package com.example.CineMatch.service;

import java.util.Map;

public interface PersonService {
    String getTrending(int page);
    String getSearch(String q, int page);
    Map<String, Object> getDetails(long id);
}
