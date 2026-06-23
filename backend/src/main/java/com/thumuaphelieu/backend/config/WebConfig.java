package com.thumuaphelieu.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOriginPatterns("*") // Dùng allowedOriginPatterns thay vì allowedOrigins("*") để hỗ trợ credentials và credentials=false
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .exposedHeaders("Content-Type", "Authorization", "ngrok-skip-browser-warning")
                        .maxAge(3600)
                        .allowCredentials(true); // Quan trọng: bật credentials để preflight hoạt động đúng
            }
        };
    }
}
