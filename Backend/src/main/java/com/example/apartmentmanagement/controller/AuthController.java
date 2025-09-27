package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.User;
import com.example.apartmentmanagement.service.UserService;
import lombok.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (adminEmail.equals(email) && adminPassword.equals(password)) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "role", "ADMIN",
                    "token", "fake-admin-token"
            ));
        }

        Optional<User> optionalUser = userService.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            boolean success = userService.login(email, password);
            if (success) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "role", "USER",
                        "userId", user.getId(),
                        "token", "fake-user-token"
                ));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", "Invalid credentials"));
    }
}


