package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.Meter;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class MeterRepositoryTest {

    @Autowired
    private MeterRepository meterRepository;

    @Autowired
    private EntityManager entityManager;

    private Meter meter1;
    private Meter meter2;
    private Meter meter3;

    @BeforeEach
    void setUp() {
        // Meter records for room "101"
        meter1 = new Meter();
        meter1.setMeterId("MTR-001");
        meter1.setRoom("101");
        meter1.setPeriod("2025-01");
        meter1.setType("Electric");
        meter1.setRecordDate(LocalDate.of(2025, 1, 5));
        meter1.setUnit(100);
        entityManager.persist(meter1);

        meter2 = new Meter();
        meter2.setMeterId("MTR-002");
        meter2.setRoom("101");
        meter2.setPeriod("2025-01");
        meter2.setType("Water");
        meter2.setRecordDate(LocalDate.of(2025, 1, 6));
        meter2.setUnit(50);
        entityManager.persist(meter2);

        meter3 = new Meter();
        meter3.setMeterId("MTR-003");
        meter3.setRoom("101");
        meter3.setPeriod("2025-02");
        meter3.setType("Electric");
        meter3.setRecordDate(LocalDate.of(2025, 2, 5));
        meter3.setUnit(120);
        entityManager.persist(meter3);

        entityManager.flush();
    }

    @Test
    @DisplayName("Should find meters by room and record date between")
    void testFindByRoomAndRecordDateBetween() {
        List<Meter> meters = meterRepository.findByRoomAndRecordDateBetween(
                "101",
                LocalDate.of(2025, 1, 1),
                LocalDate.of(2025, 1, 31)
        );
        assertEquals(2, meters.size());
        assertTrue(meters.stream().anyMatch(m -> m.getMeterId().equals("MTR-001")));
        assertTrue(meters.stream().anyMatch(m -> m.getMeterId().equals("MTR-002")));
    }

    @Test
    @DisplayName("Should find top meter by period and room ordered by meterId desc")
    void testFindTopByPeriodAndRoomOrderByMeterIdDesc() {
        Meter topMeter = meterRepository.findTopByPeriodAndRoomOrderByMeterIdDesc("2025-01", "101");
        assertNotNull(topMeter);
        assertEquals("MTR-002", topMeter.getMeterId());
    }

    @Test
    @DisplayName("Should find meter by room, period, type and record date")
    void testFindByRoomAndPeriodAndTypeAndRecordDate() {
        Meter found = meterRepository.findByRoomAndPeriodAndTypeAndRecordDate(
                "101", "2025-01", "Electric", LocalDate.of(2025, 1, 5)
        );
        assertNotNull(found);
        assertEquals("MTR-001", found.getMeterId());
    }

    @Test
    @DisplayName("Should return null if meter not found by room, period, type and record date")
    void testFindByRoomAndPeriodAndTypeAndRecordDateNotFound() {
        Meter found = meterRepository.findByRoomAndPeriodAndTypeAndRecordDate(
                "101", "2025-01", "Gas", LocalDate.of(2025, 1, 5)
        );
        assertNull(found);
    }

    @Test
    @DisplayName("Should find all meters by room ordered by record date descending")
    void testFindByRoomOrderByRecordDateDesc() {
        List<Meter> meters = meterRepository.findByRoomOrderByRecordDateDesc("101");
        assertEquals(3, meters.size());
        assertEquals("MTR-003", meters.get(0).getMeterId());
        assertEquals("MTR-002", meters.get(1).getMeterId());
        assertEquals("MTR-001", meters.get(2).getMeterId());
    }

    @Test
    @DisplayName("Should return empty list if room has no meters")
    void testFindByRoomOrderByRecordDateDescNoMeters() {
        List<Meter> meters = meterRepository.findByRoomOrderByRecordDateDesc("102");
        assertTrue(meters.isEmpty());
    }

    @Test
    @DisplayName("Should find meters by room and period")
    void testFindByRoomAndPeriod() {
        List<Meter> meters = meterRepository.findByRoomAndPeriod("101", "2025-01");

        assertEquals(2, meters.size());
        assertTrue(meters.stream().anyMatch(m -> m.getMeterId().equals("MTR-001")));
        assertTrue(meters.stream().anyMatch(m -> m.getMeterId().equals("MTR-002")));

        meters = meterRepository.findByRoomAndPeriod("101", "2025-02");
        assertEquals(1, meters.size());
        assertEquals("MTR-003", meters.get(0).getMeterId());

        meters = meterRepository.findByRoomAndPeriod("101", "2025-03");
        assertTrue(meters.isEmpty());
    }

}
