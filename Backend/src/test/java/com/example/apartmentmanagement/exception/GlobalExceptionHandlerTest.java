package com.example.apartmentmanagement.exception;

import com.example.apartmentmanagement.dto.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void handleNotFound_returnsNotFoundResponse() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Room not found");
        var response = handler.handleNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        ApiResponse<String> body = response.getBody();
        assertNotNull(body);
        assertFalse(body.isSuccess());
        assertEquals("Room not found", body.getMessage());
    }

    @Test
    void handleResponseStatus_withReason_returnsReason() {
        ResponseStatusException ex = new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid input");
        var response = handler.handleResponseStatus(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ApiResponse<String> body = response.getBody();
        assertNotNull(body);
        assertEquals("Invalid input", body.getMessage()); // ใช้ ex.getReason()
    }

    @Test
    void handleResponseStatus_withoutReason_returnsDefault() {
        // ResponseStatusException constructor ที่ไม่ใส่ reason
        ResponseStatusException ex = new ResponseStatusException(HttpStatus.CONFLICT, null);
        var response = handler.handleResponseStatus(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        ApiResponse<String> body = response.getBody();
        assertNotNull(body);
        assertEquals("Request conflict", body.getMessage()); // fallback
    }

    @Test
    void handleResponseStatus_returnsCorrectStatus() {
        ResponseStatusException ex = new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid input");
        var response = handler.handleResponseStatus(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ApiResponse<String> body = response.getBody();
        assertNotNull(body);
        assertFalse(body.isSuccess());
        assertEquals("Invalid input", body.getMessage());
    }

    @Test
    void handleDataIntegrity_returnsConflict() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException("Duplicate key");
        var response = handler.handleDataIntegrity(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        ApiResponse<String> body = response.getBody();
        assertNotNull(body);
        assertFalse(body.isSuccess());
        assertTrue(body.getMessage().contains("Data integrity violation"));
    }

    @Test
    void handleException_returnsInternalServerError() {
        Exception ex = new Exception("Something went wrong");
        var response = handler.handleException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        ApiResponse<String> body = response.getBody();
        assertNotNull(body);
        assertFalse(body.isSuccess());
        assertTrue(body.getMessage().contains("Unexpected error"));
        assertTrue(body.getMessage().contains("Something went wrong"));
    }

    @Test
    void handleRuntime_ReturnsInternalServerError() {
        RuntimeException ex = new RuntimeException("Test exception");

        ResponseEntity<String> response = handler.handleRuntime(ex);

        assertNotNull(response);
        assertEquals(500, response.getStatusCodeValue());
        assertEquals("Test exception", response.getBody());
    }

    @Test
    void handleRuntime_EmptyMessage() {
        RuntimeException ex = new RuntimeException();

        ResponseEntity<String> response = handler.handleRuntime(ex);

        assertNotNull(response);
        assertEquals(500, response.getStatusCodeValue());
        assertNull(response.getBody()); // เพราะไม่มี message
    }
}
