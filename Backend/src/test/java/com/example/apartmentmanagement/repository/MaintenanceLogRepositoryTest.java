package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.MaintenanceLog;
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
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class MaintenanceLogRepositoryIntegrationTest {

    @Autowired
    private MaintenanceLogRepository maintenanceLogRepository;

    @Autowired
    private EntityManager entityManager;

    private RoomType deluxeType;
    private Room room101;
    private MaintenanceLog log1;
    private MaintenanceLog log2;
    private MaintenanceLog log3;

    @BeforeEach
    void setUp() {
        // RoomType
        deluxeType = RoomType.builder()
                .roomTypeId("RT01")
                .name("Deluxe")
                .description("Standard Room")
                .price(BigDecimal.valueOf(1000))
                .room_image("roomA.jpg")
                .build();
        entityManager.persist(deluxeType);

        // Room
        room101 = Room.builder()
                .roomNum("101")
                .roomType(deluxeType)
                .status("available")
                .build();
        entityManager.persist(room101);

        // Maintenance Logs
        log1 = MaintenanceLog.builder()
                .logId("ML-2025-001")
                .room(room101)
                .logType("Plumbing")
                .status("done")
                .cost(100)
                .requestDate(LocalDate.now().minusDays(5))
                .build();
        log2 = MaintenanceLog.builder()
                .logId("ML-2025-002")
                .room(room101)
                .logType("Electric")
                .status("pending")
                .cost(200)
                .requestDate(LocalDate.now().minusDays(3))
                .build();
        log3 = MaintenanceLog.builder()
                .logId("ML-2025-003")
                .room(room101)
                .logType("Plumbing")
                .status("done")
                .cost(150)
                .requestDate(LocalDate.now().minusDays(1))
                .build();

        entityManager.persist(log1);
        entityManager.persist(log2);
        entityManager.persist(log3);
        entityManager.flush();
    }

    @Test
    @DisplayName("Should find the latest maintenance log")
    void testFindTopByOrderByLogIdDesc() {
        Optional<MaintenanceLog> latest = maintenanceLogRepository.findTopByOrderByLogIdDesc();
        assertTrue(latest.isPresent());
        assertEquals("ML-2025-003", latest.get().getLogId());
    }

    @Test
    @DisplayName("Should count logs by room number and status")
    void testCountByRoomRoomNumAndStatus() {
        Long countDone = maintenanceLogRepository.countByRoomRoomNumAndStatus("101", "done");
        Long countPending = maintenanceLogRepository.countByRoomRoomNumAndStatus("101", "pending");

        assertEquals(2L, countDone);
        assertEquals(1L, countPending);
    }

    @Test
    @DisplayName("Should find logs by room number ordered by request date descending")
    void testFindByRoomRoomNumOrderByRequestDateDesc() {
        List<MaintenanceLog> logs = maintenanceLogRepository.findByRoomRoomNumOrderByRequestDateDesc("101");
        assertEquals(3, logs.size());
        assertEquals("ML-2025-003", logs.get(0).getLogId());
        assertEquals("ML-2025-002", logs.get(1).getLogId());
        assertEquals("ML-2025-001", logs.get(2).getLogId());
    }

    @Test
    @DisplayName("Should sum cost of logs between dates")
    void testSumCostByDateBetween() {
        BigDecimal sum = maintenanceLogRepository.sumCostByDateBetween(
                LocalDate.now().minusDays(4),
                LocalDate.now()
        );
        assertEquals(BigDecimal.valueOf(350.0), sum);
    }

    @Test
    @DisplayName("Should get maintenance summary grouped by log type")
    void testFindMaintenanceSummaryByDateBetween() {
        List<Object[]> summary = maintenanceLogRepository.findMaintenanceSummaryByDateBetween(
                LocalDate.now().minusDays(7),
                LocalDate.now()
        );

        assertEquals(2, summary.size());

        for (Object[] row : summary) {
            String type = (String) row[0];
            Long count = (Long) row[1];
            double cost = (double) row[2];

            if (type.equals("Plumbing")) {
                assertEquals(2L, count);
                assertEquals(250.0, cost); // 100 + 150
            } else if (type.equals("Electric")) {
                assertEquals(1L, count);
                assertEquals(200.0, cost);
            } else {
                fail("Unexpected log type: " + type);
            }
        }
    }
}
