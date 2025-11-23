package  com.example.CineMatch.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.util.List;

public class MovieDTO {
    private String id;
    private String title;
    private String posterPath;
    private String overview;
    private Double rating;
    private List<String> genres;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate releaseDate;

    // Constructors
    public MovieDTO() {}

    public MovieDTO(String id, String title, String posterPath, String overview,
                    Double rating, List<String> genres, LocalDate releaseDate) {
        this.id = id;
        this.title = title;
        this.posterPath = posterPath;
        this.overview = overview;
        this.rating = rating;
        this.genres = genres;
        this.releaseDate = releaseDate;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPosterPath() { return posterPath; }
    public void setPosterPath(String posterPath) { this.posterPath = posterPath; }

    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public List<String> getGenres() { return genres; }
    public void setGenres(List<String> genres) { this.genres = genres; }

    public LocalDate getReleaseDate() { return releaseDate; }
    public void setReleaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; }
}