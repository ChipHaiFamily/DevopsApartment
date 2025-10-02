package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.Reservation;
import com.example.apartmentmanagement.model.Room;
import com.example.apartmentmanagement.repository.ReservationRepository;
import com.example.apartmentmanagement.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepo;
    @Mock
    private RoomRepository roomRepo;
    @Mock
    private IdGenerationService idGenService;

    @InjectMocks
    private ReservationService reservationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void create_generatesReservationIdAndPendingStatus() {
        Reservation reservation = new Reservation();

        // mock ID generator
        String generatedId = "RSV-" + LocalDate.now().getYear() + "-001";
        when(idGenService.generateReservationId()).thenReturn(generatedId);
        when(reservationRepo.save(reservation)).thenReturn(reservation);

        Reservation created = reservationService.create(reservation);

        // ตรวจ ID pattern และ status
        assertNotNull(created.getReservationNum());
        assertTrue(created.getReservationNum().matches("RSV-\\d{4}-\\d{3}"));
        assertEquals("pending", created.getStatus());
    }

    @Test
    void update_assignRoom_setsReservedAndProcessingStatus() {
        Reservation reservation = new Reservation();
        reservation.setAssignedRoom("R-101");

        Room room = new Room();
        room.setRoomNum("R-101");
        room.setStatus("available");

        when(roomRepo.findById("R-101")).thenReturn(Optional.of(room));
        when(reservationRepo.save(reservation)).thenReturn(reservation);

        Reservation updated = reservationService.update(reservation);

        assertEquals("processing", updated.getStatus());
        assertEquals("reserved", room.getStatus());
    }

    @Test
    void update_withoutAssignedRoom_savesAsIs() {
        Reservation reservation = new Reservation();
        reservation.setStatus("pending");

        when(reservationRepo.save(reservation)).thenReturn(reservation);

        Reservation updated = reservationService.update(reservation);

        assertEquals("pending", updated.getStatus());
    }

    @Test
    void findAll_returnsAllReservations() {
        Reservation r1 = new Reservation();
        Reservation r2 = new Reservation();
        when(reservationRepo.findAll()).thenReturn(List.of(r1, r2));

        List<Reservation> list = reservationService.findAll();
        assertEquals(2, list.size());
    }

    @Test
    void findById_returnsReservation() {
        Reservation r = new Reservation();
        when(reservationRepo.findById("RSV-001")).thenReturn(Optional.of(r));

        Optional<Reservation> result = reservationService.findById("RSV-001");
        assertTrue(result.isPresent());
        assertEquals(r, result.get());
    }

    @Test
    void save_callsRepositorySave() {
        Reservation r = new Reservation();
        when(reservationRepo.save(r)).thenReturn(r);

        Reservation result = reservationService.save(r);
        assertEquals(r, result);
    }

    @Test
    void deleteById_callsRepositoryDelete() {
        reservationService.deleteById("RSV-001");
        verify(reservationRepo, times(1)).deleteById("RSV-001");
    }
}