package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.MaintenanceSchedule;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class MaintenanceScheduleRepositoryTest {

    @Autowired
    private MaintenanceScheduleRepository scheduleRepository;

    @Autowired
    private EntityManager entityManager;

    @BeforeEach
    void setUp() {
        MaintenanceSchedule schedule1 = MaintenanceSchedule.builder()
                .scheduleId("MS-001")
                .taskName("Routine check")
                .nextDue(LocalDate.now().plusDays(1))
                .build();

        MaintenanceSchedule schedule2 = MaintenanceSchedule.builder()
                .scheduleId("MS-002")
                .taskName("Repair AC")
                .nextDue(LocalDate.now().plusDays(2))
                .build();

        entityManager.persist(schedule1);
        entityManager.persist(schedule2);
        entityManager.flush();
    }

    @Test
    @DisplayName("Should find latest schedule by scheduleId desc")
    void testFindTopByOrderByScheduleIdDesc() {
        Optional<MaintenanceSchedule> latest = scheduleRepository.findTopByOrderByScheduleIdDesc();
        assertTrue(latest.isPresent());
        assertEquals("MS-002", latest.get().getScheduleId());
    }
}
