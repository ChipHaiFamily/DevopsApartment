package com.example.apartmentmanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())   // ปิด CSRF
                .cors(cors -> {})              // เปิด CORS
                .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/actuator/**", // เฉพาะ health/info
                    "/api/**",      // ถ้ามี REST API
                    "/", "/**"      // หน้าอื่น
                ).permitAll()
                .anyRequest().permitAll()
            );

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
