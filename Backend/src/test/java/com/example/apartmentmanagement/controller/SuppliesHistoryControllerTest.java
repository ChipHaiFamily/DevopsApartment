package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.SuppliesHistory;
import com.example.apartmentmanagement.service.SuppliesHistoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SuppliesHistoryControllerTest {

    @Mock
    private SuppliesHistoryService service;

    @InjectMocks
    private SuppliesHistoryController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAll_returnsList() {
        SuppliesHistory h1 = SuppliesHistory.builder().historyId("H1").build();
        SuppliesHistory h2 = SuppliesHistory.builder().historyId("H2").build();

        when(service.findAll()).thenReturn(List.of(h1, h2));

        ResponseEntity<List<SuppliesHistory>> response = controller.getAll();

        assertEquals(2, response.getBody().size());
        assertEquals(200, response.getStatusCodeValue());
        verify(service).findAll();
    }

    @Test
    void getById_found_returns200() {
        SuppliesHistory h = SuppliesHistory.builder().historyId("H1").build();

        when(service.findById("H1")).thenReturn(Optional.of(h));

        ResponseEntity<SuppliesHistory> response = controller.getById("H1");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("H1", response.getBody().getHistoryId());
        verify(service).findById("H1");
    }

    @Test
    void getById_notFound_returns404() {
        when(service.findById("H1")).thenReturn(Optional.empty());

        ResponseEntity<SuppliesHistory> response = controller.getById("H1");

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(service).findById("H1");
    }

    @Test
    void create_returnsSavedObject() {
        SuppliesHistory input = SuppliesHistory.builder().historyId("H3").build();
        SuppliesHistory saved = SuppliesHistory.builder().historyId("H3").build();

        when(service.save(input)).thenReturn(saved);

        ResponseEntity<SuppliesHistory> response = controller.create(input);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("H3", response.getBody().getHistoryId());
        verify(service).save(input);
    }

    @Test
    void delete_returns204() {
        doNothing().when(service).deleteById("H1");

        ResponseEntity<Void> response = controller.delete("H1");

        assertEquals(204, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(service).deleteById("H1");
    }
}