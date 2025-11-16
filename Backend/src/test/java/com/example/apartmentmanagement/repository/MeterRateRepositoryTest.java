package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.MeterRate;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class MeterRateRepositoryTest {

    @Autowired
    private MeterRateRepository meterRateRepository;

    @Autowired
    private EntityManager entityManager;

    private MeterRate rateA1;
    private MeterRate rateA2;
    private MeterRate rateB1;

    @BeforeEach
    void setUp() {
        // type A rates
        rateA1 = new MeterRate();
        rateA1.setType("A");
        rateA1.setRate(1.5);
        rateA1.setTimestamp(OffsetDateTime.now().minusDays(2));
        entityManager.persist(rateA1);

        rateA2 = new MeterRate();
        rateA2.setType("A");
        rateA2.setRate(2.0);
        rateA2.setTimestamp(OffsetDateTime.now().minusDays(1));
        entityManager.persist(rateA2);

        // type B rate
        rateB1 = new MeterRate();
        rateB1.setType("B");
        rateB1.setRate(3.0);
        rateB1.setTimestamp(OffsetDateTime.now());
        entityManager.persist(rateB1);

        entityManager.flush();
    }

    @Test
    @DisplayName("Should find latest rate per type using native query")
    void testFindLatestRatesForAllTypes() {
        List<MeterRate> latestRates = meterRateRepository.findLatestRatesForAllTypes();
        assertEquals(2, latestRates.size());

        // type A latest
        MeterRate latestA = latestRates.stream()
                .filter(r -> r.getType().equals("A"))
                .findFirst().orElse(null);
        assertNotNull(latestA);
        assertEquals(2.0, latestA.getRate());

        // type B latest
        MeterRate latestB = latestRates.stream()
                .filter(r -> r.getType().equals("B"))
                .findFirst().orElse(null);
        assertNotNull(latestB);
        assertEquals(3.0, latestB.getRate());
    }

    @Test
    @DisplayName("Should find all rates by type ordered by timestamp descending")
    void testFindByTypeOrderByTimestampDesc() {
        List<MeterRate> ratesA = meterRateRepository.findByTypeOrderByTimestampDesc("A");
        assertEquals(2, ratesA.size());
        assertEquals(2.0, ratesA.get(0).getRate());
        assertEquals(1.5, ratesA.get(1).getRate());

        List<MeterRate> ratesB = meterRateRepository.findByTypeOrderByTimestampDesc("B");
        assertEquals(1, ratesB.size());
        assertEquals(3.0, ratesB.get(0).getRate());
    }

    @Test
    @DisplayName("Should find top (latest) rate by type")
    void testFindTopByTypeOrderByTimestampDesc() {
        MeterRate topA = meterRateRepository.findTopByTypeOrderByTimestampDesc("A");
        assertNotNull(topA);
        assertEquals(2.0, topA.getRate());

        MeterRate topB = meterRateRepository.findTopByTypeOrderByTimestampDesc("B");
        assertNotNull(topB);
        assertEquals(3.0, topB.getRate());
    }

    @Test
    @DisplayName("Should return null if type not exists")
    void testFindTopByTypeOrderByTimestampDescNotExist() {
        MeterRate topC = meterRateRepository.findTopByTypeOrderByTimestampDesc("C");
        assertNull(topC);
    }
}