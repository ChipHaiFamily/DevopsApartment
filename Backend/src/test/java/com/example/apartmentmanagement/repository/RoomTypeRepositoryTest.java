package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.RoomType;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class RoomTypeRepositoryTest {

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private EntityManager entityManager;

    private RoomType typeA;
    private RoomType typeB;

    @BeforeEach
    void setUp() {
        typeA = RoomType.builder()
                .roomTypeId("RT01")
                .name("Deluxe")
                .description("Standard Deluxe Room")
                .price(BigDecimal.valueOf(1000))
                .room_image("deluxe.jpg")
                .build();

        typeB = RoomType.builder()
                .roomTypeId("RT02")
                .name("Suite")
                .description("Luxury Suite")
                .price(BigDecimal.valueOf(2000))
                .room_image("suite.jpg")
                .build();

        entityManager.persist(typeA);
        entityManager.persist(typeB);
        entityManager.flush();
    }

    @Test
    @DisplayName("Should find top RoomType by RoomTypeId desc")
    void testFindTopByOrderByRoomTypeIdDesc() {
        Optional<RoomType> top = roomTypeRepository.findTopByOrderByRoomTypeIdDesc();
        assertTrue(top.isPresent());
        assertEquals("RT02", top.get().getRoomTypeId());
    }

    @Test
    @DisplayName("Should return empty optional when no RoomType exists")
    void testFindTopByOrderByRoomTypeIdDescEmpty() {
        roomTypeRepository.deleteAll();
        Optional<RoomType> top = roomTypeRepository.findTopByOrderByRoomTypeIdDesc();
        assertFalse(top.isPresent());
    }
}