package com.example.CineMatch.service;

import com.example.CineMatch.dto.MovieDTO;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MovieServiceImpl implements MovieService {

    @Override
    public List<MovieDTO> getTrendingMovies() {
        // Empty - will be implemented when TMD API is connected
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public MovieDTO getMovieById(String id) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public List<MovieDTO> getMoviesByGenre(String genre) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}