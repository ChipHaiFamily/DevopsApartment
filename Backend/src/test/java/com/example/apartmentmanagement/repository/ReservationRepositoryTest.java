package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.Reservation;
import com.example.apartmentmanagement.model.Room;
import com.example.apartmentmanagement.model.RoomType;
import com.example.apartmentmanagement.model.User;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class ReservationRepositoryIntegrationTest {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private EntityManager entityManager;

    private RoomType room1;

    @BeforeEach
    void setUp() {
        // Create Room
        room1 = RoomType.builder()
                .roomTypeId("RT01")
                .name("Deluxe")
                .description("Standard Room")
                .price(BigDecimal.valueOf(1000))
                .room_image("roomA.jpg")
                .build();
        entityManager.persist(room1);

        // create user
        User user1 = User.builder()
                .id("USR-001")
                .fullName("Full Name")
                .email("user1.c@gmail.com")
                .passwd("pass")
                .build();
        entityManager.persist(user1);

        User user2 = User.builder()
                .id("USR-002")
                .fullName("My Name")
                .email("user2.c@gmail.com")
                .passwd("pass")
                .build();
        entityManager.persist(user2);

        // Create Reservations
        Reservation res1 = Reservation.builder()
                .reservationNum("RSV-2025-001")
                .roomType(room1)
                .user(user1)
                .dateTime(LocalDateTime.now().minusDays(2))
                .build();

        Reservation res2 = Reservation.builder()
                .reservationNum("RSV-2025-002")
                .roomType(room1)
                .user(user2)
                .dateTime(LocalDateTime.now().minusDays(1))
                .build();

        entityManager.persist(res1);
        entityManager.persist(res2);
        entityManager.flush();
    }

    @Test
    @DisplayName("Should find latest reservation by reservationNum desc")
    void testFindTopByOrderByReservationNumDesc() {
        Optional<Reservation> latest = reservationRepository.findTopByOrderByReservationNumDesc();
        assertTrue(latest.isPresent());
        assertEquals("RSV-2025-002", latest.get().getReservationNum());
    }
}
