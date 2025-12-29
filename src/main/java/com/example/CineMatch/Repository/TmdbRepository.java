package com.example.CineMatch.Repository;

import java.util.Map;

public interface TmdbRepository {
    String call(String endpoint);
    Map<String, Object> callMap(String endpoint);
}
