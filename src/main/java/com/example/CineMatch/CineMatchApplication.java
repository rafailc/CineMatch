package com.example.CineMatch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class CineMatchApplication {

    public static void main(String[] args) {
        SpringApplication.run(CineMatchApplication.class, args);
    }

    // 💡 RestTemplate  Bean
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}