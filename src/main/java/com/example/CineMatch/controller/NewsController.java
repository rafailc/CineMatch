package com.example.CineMatch.controller;


import com.example.CineMatch.dto.NewsItem;
import com.rometools.rome.feed.synd.*;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.springframework.web.bind.annotation.*;

import java.net.URL;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "http://localhost:5173")
public class NewsController {

    // Good, simple feeds that usually work:
    private static final List<Map.Entry<String, String>> FEEDS = List.of(
            Map.entry("Deadline", "https://deadline.com/feed/"),
            Map.entry("IndieWire", "https://www.indiewire.com/feed/")
            // Hollywood Reporter has a feed too:
            // Map.entry("Hollywood Reporter", "https://www.hollywoodreporter.com/c/movies/feed/")
    );

    @GetMapping
    public List<NewsItem> news(@RequestParam(defaultValue = "25") int limit) {
        List<NewsItem> items = new ArrayList<>();

        for (var feed : FEEDS) {
            String sourceName = feed.getKey();
            String url = feed.getValue();

            try (XmlReader reader = new XmlReader(new URL(url))) {
                SyndFeed syndFeed = new SyndFeedInput().build(reader);

                for (SyndEntry entry : syndFeed.getEntries()) {
                    String published = null;
                    Date d = entry.getPublishedDate();
                    if (d != null) {
                        published = OffsetDateTime.ofInstant(d.toInstant(), java.time.ZoneOffset.UTC)
                                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
                    }

                    items.add(new NewsItem(
                            entry.getTitle(),
                            entry.getLink(),
                            sourceName,
                            published
                    ));
                }
            } catch (Exception ignored) {
                // If one feed fails, we still return the others.
            }
        }

        // Sort newest first (nulls last)
        items.sort((a, b) -> {
            if (a.publishedAt() == null && b.publishedAt() == null) return 0;
            if (a.publishedAt() == null) return 1;
            if (b.publishedAt() == null) return -1;
            return b.publishedAt().compareTo(a.publishedAt());
        });

        if (limit < 1) limit = 1;
        return items.subList(0, Math.min(limit, items.size()));
    }
}
