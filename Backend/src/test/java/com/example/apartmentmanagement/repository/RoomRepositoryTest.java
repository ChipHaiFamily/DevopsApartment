package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.Room;
import com.example.apartmentmanagement.model.RoomType;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class RoomRepositoryTest {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private EntityManager entityManager;

    private RoomType deluxeType;
    private RoomType suiteType;

    @BeforeEach
    void setUp() {
        deluxeType = RoomType.builder()
                .roomTypeId("RT01")
                .name("Deluxe")
                .description("Standard Deluxe Room")
                .price(BigDecimal.valueOf(1000))
                .room_image("deluxe.jpg")
                .build();

        suiteType = RoomType.builder()
                .roomTypeId("RT02")
                .name("Suite")
                .description("Luxury Suite")
                .price(BigDecimal.valueOf(2000))
                .room_image("suite.jpg")
                .build();

        entityManager.persist(deluxeType);
        entityManager.persist(suiteType);

        Room room101 = Room.builder()
                .roomNum("101")
                .roomType(deluxeType)
                .status("available")
                .build();

        Room room102 = Room.builder()
                .roomNum("102")
                .roomType(deluxeType)
                .status("occupied")
                .build();

        Room room201 = Room.builder()
                .roomNum("201")
                .roomType(suiteType)
                .status("available")
                .build();

        entityManager.persist(room101);
        entityManager.persist(room102);
        entityManager.persist(room201);

        entityManager.flush();
    }

    @Test
    @DisplayName("Should count all rooms")
    void testCountAllRooms() {
        int totalRooms = roomRepository.countAllRooms();
        assertEquals(3, totalRooms);
    }

    @Test
    @DisplayName("Should count rooms by type name")
    void testCountByTypeName() {
        int deluxeCount = roomRepository.countByTypeName("Deluxe");
        int suiteCount = roomRepository.countByTypeName("Suite");
        int unknownCount = roomRepository.countByTypeName("Unknown"); // edge case

        assertEquals(2, deluxeCount);
        assertEquals(1, suiteCount);
        assertEquals(0, unknownCount); // should return 0 if type not exist
    }

    @Test
    @DisplayName("Should find all distinct room type names")
    void testFindAllRoomTypeNames() {
        List<String> typeNames = roomRepository.findAllRoomTypeNames();
        assertEquals(2, typeNames.size());
        assertTrue(typeNames.contains("Deluxe"));
        assertTrue(typeNames.contains("Suite"));
    }

    @Test
    @DisplayName("Should return empty list if no room types exist")
    void testFindAllRoomTypeNamesEmpty() {
        roomRepository.deleteAll(); // remove all rooms
        List<String> typeNames = roomRepository.findAllRoomTypeNames();
        assertTrue(typeNames.isEmpty());
    }

    @Test
    @DisplayName("Should return 0 if no rooms exist for countAllRooms")
    void testCountAllRoomsEmpty() {
        roomRepository.deleteAll();
        int totalRooms = roomRepository.countAllRooms();
        assertEquals(0, totalRooms);
    }
}