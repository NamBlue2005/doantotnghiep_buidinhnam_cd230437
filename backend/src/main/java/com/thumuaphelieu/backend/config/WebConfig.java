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
                // Cho phép tất cả các request từ mọi nguồn đến các endpoint /api/**
                registry.addMapping("/api/**")
                        .allowedOrigins("*") // Chấp nhận request từ bất kỳ domain nào
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các phương thức được phép
                        .allowedHeaders("*") // Cho phép tất cả các header
                        .allowCredentials(false);
            }
        };
    }
}

