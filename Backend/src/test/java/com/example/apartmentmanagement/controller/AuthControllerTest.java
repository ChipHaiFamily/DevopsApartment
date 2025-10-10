package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.User;
import com.example.apartmentmanagement.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.http.ResponseEntity;

import java.lang.reflect.Field;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() throws Exception { // หรือ catch exception ข้างใน
        MockitoAnnotations.openMocks(this);
        authController = new AuthController(userService);
        Field adminEmailField = AuthController.class.getDeclaredField("adminEmail");
        adminEmailField.setAccessible(true);
        adminEmailField.set(authController, "admin@mail.com");

        Field adminPasswordField = AuthController.class.getDeclaredField("adminPassword");
        adminPasswordField.setAccessible(true);
        adminPasswordField.set(authController, "admin123");
    }

    @Test
    void login_withAdminCredentials_returnsAdminToken() {
        Map<String, String> body = Map.of(
                "email", "admin@mail.com",
                "password", "admin123"
        );

        ResponseEntity<Map<String, Object>> response = authController.login(body);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue((Boolean) response.getBody().get("success"));
        assertEquals("ADMIN", response.getBody().get("role"));
        assertEquals("fake-admin-token", response.getBody().get("token"));
    }

    @Test
    void login_withUserCredentials_success() {
        Map<String, String> body = Map.of(
                "email", "user@mail.com",
                "password", "userpass"
        );

        User user = new User();
        user.setId("USR-001");
        when(userService.findByEmail("user@mail.com")).thenReturn(Optional.of(user));
        when(userService.login("user@mail.com", "userpass")).thenReturn(true);

        ResponseEntity<Map<String, Object>> response = authController.login(body);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue((Boolean) response.getBody().get("success"));
        assertEquals("USER", response.getBody().get("role"));
        assertEquals("USR-001", response.getBody().get("userId"));
        assertEquals("fake-user-token", response.getBody().get("token"));
    }

    @Test
    void login_withUserCredentials_fail() {
        Map<String, String> body = Map.of(
                "email", "user@mail.com",
                "password", "wrongpass"
        );

        User user = new User();
        user.setId("USR-002");
        when(userService.findByEmail("user@mail.com")).thenReturn(Optional.of(user));
        when(userService.login("user@mail.com", "wrongpass")).thenReturn(false);

        ResponseEntity<Map<String, Object>> response = authController.login(body);

        assertEquals(401, response.getStatusCodeValue());
        assertFalse((Boolean) response.getBody().get("success"));
        assertEquals("Invalid credentials", response.getBody().get("message"));
    }

    @Test
    void login_withUnknownEmail_returnsUnauthorized() {
        Map<String, String> body = Map.of(
                "email", "unknown@mail.com",
                "password", "any"
        );

        when(userService.findByEmail("unknown@mail.com")).thenReturn(Optional.empty());

        ResponseEntity<Map<String, Object>> response = authController.login(body);

        assertEquals(401, response.getStatusCodeValue());
        assertFalse((Boolean) response.getBody().get("success"));
        assertEquals("Invalid credentials", response.getBody().get("message"));
    }
}
