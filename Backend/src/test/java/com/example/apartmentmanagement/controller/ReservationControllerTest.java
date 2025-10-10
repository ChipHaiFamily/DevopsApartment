package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.Reservation;
import com.example.apartmentmanagement.service.ReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReservationControllerTest {

    @Mock
    private ReservationService service;

    @InjectMocks
    private ReservationController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAll_returnsList() {
        Reservation r1 = new Reservation();
        Reservation r2 = new Reservation();
        when(service.findAll()).thenReturn(List.of(r1, r2));

        List<Reservation> result = controller.getAll();

        assertEquals(2, result.size());
        verify(service).findAll();
    }

    @Test
    void getById_returnsReservation() {
        Reservation r = new Reservation();
        when(service.findById("RES-001")).thenReturn(Optional.of(r));

        Optional<Reservation> result = controller.getById("RES-001");

        assertTrue(result.isPresent());
        assertEquals(r, result.get());
        verify(service).findById("RES-001");
    }

    @Test
    void create_savesReservation() {
        Reservation r = new Reservation();
        when(service.create(r)).thenReturn(r);

        Reservation result = controller.create(r);

        assertEquals(r, result);
        verify(service).create(r);
    }

    @Test
    void update_setsIdAndUpdates() {
        Reservation r = new Reservation();
        Reservation updated = new Reservation();
        when(service.update(r)).thenReturn(updated);

        Reservation result = controller.update("RES-005", r);

        assertEquals(updated, result);
        assertEquals("RES-005", r.getReservationNum());
        verify(service).update(r);
    }

    @Test
    void delete_callsServiceDelete() {
        controller.delete("RES-010");
        verify(service).deleteById("RES-010");
    }
}
