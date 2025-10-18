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
        String generatedId = "RSV-" + LocalDate.now().getYear() + "-001";

        when(idGenService.generateReservationId()).thenReturn(generatedId);
        when(reservationRepo.save(any(Reservation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Reservation created = reservationService.create(reservation);

        assertEquals(generatedId, created.getReservationNum());
        assertEquals("pending", created.getStatus());
        verify(reservationRepo).save(any(Reservation.class));
    }

    @Test
    void update_assignRoom_setsRoomReservedAndProcessingStatus() {
        Reservation reservation = new Reservation();
        reservation.setAssignedRoom("101");
        reservation.setStatus("processing"); // <--- add this

        Room room = new Room();
        room.setRoomNum("101");
        room.setStatus("available");

        when(roomRepo.findById("101")).thenReturn(Optional.of(room));
        when(reservationRepo.save(any(Reservation.class))).thenReturn(reservation);

        Reservation updated = reservationService.update(reservation);

        assertEquals("reserved", room.getStatus());
        assertEquals("processing", updated.getStatus());
        verify(reservationRepo).save(reservation);
    }


    @Test
    void update_withoutAssignedRoom_savesAsIs() {
        Reservation reservation = new Reservation();
        reservation.setStatus("pending");

        when(reservationRepo.save(any(Reservation.class))).thenReturn(reservation);

        Reservation updated = reservationService.update(reservation);

        assertEquals("pending", updated.getStatus());
        verify(reservationRepo, times(1)).save(reservation);
        verifyNoInteractions(roomRepo);
    }

    @Test
    void update_withEmptyRoomNum_savesAsIs() {
        Reservation reservation = new Reservation();
        reservation.setAssignedRoom(""); // empty string
        reservation.setStatus("pending");

        when(reservationRepo.save(any(Reservation.class))).thenReturn(reservation);

        Reservation updated = reservationService.update(reservation);

        assertEquals("pending", updated.getStatus());
        verify(reservationRepo, times(1)).save(reservation);
        verifyNoInteractions(roomRepo);
    }

    @Test
    void update_roomNotFound_throwsException() {
        Reservation reservation = new Reservation();
        reservation.setAssignedRoom("999");

        when(roomRepo.findById("999")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> reservationService.update(reservation));
        assertTrue(ex.getMessage().contains("Room not found"));
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
        when(reservationRepo.findById("RSV-2025-001")).thenReturn(Optional.of(r));

        Optional<Reservation> result = reservationService.findById("RSV-2025-001");
        assertTrue(result.isPresent());
        assertEquals(r, result.get());
    }

    @Test
    void save_callsRepositorySave() {
        Reservation r = new Reservation();
        when(reservationRepo.save(any(Reservation.class))).thenReturn(r);

        Reservation result = reservationService.save(r);
        assertEquals(r, result);
    }

    @Test
    void deleteById_callsRepositoryDelete() {
        reservationService.deleteById("RSV-2025-001");
        verify(reservationRepo, times(1)).deleteById("RSV-2025-001");
    }
}