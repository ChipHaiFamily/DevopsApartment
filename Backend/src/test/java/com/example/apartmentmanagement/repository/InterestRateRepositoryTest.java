package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.InterestRate;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class InterestRateRepositoryTest {

    @Autowired
    private InterestRateRepository interestRateRepository;

    @Autowired
    private EntityManager entityManager;

    private InterestRate rate1;
    private InterestRate rate2;
    private InterestRate rate3;

    @BeforeEach
    void setUp() {
        // interest rate type "A"
        rate1 = new InterestRate();
        rate1.setType("A");
        rate1.setPercentage(1.5);
        rate1.setTimestamp(OffsetDateTime.now().minusDays(2));
        entityManager.persist(rate1);

        rate2 = new InterestRate();
        rate2.setType("A");
        rate2.setPercentage(2.0);
        rate2.setTimestamp(OffsetDateTime.now().minusDays(1));
        entityManager.persist(rate2);

        // interest rate type "B"
        rate3 = new InterestRate();
        rate3.setType("B");
        rate3.setPercentage(3.0);
        rate3.setTimestamp(OffsetDateTime.now());
        entityManager.persist(rate3);

        entityManager.flush();
    }

    @Test
    @DisplayName("Should find latest rate per type using native query")
    void testFindLatestRatesForAllTypes() {
        List<InterestRate> latestRates = interestRateRepository.findLatestRatesForAllTypes();
        assertEquals(2, latestRates.size());

        // type A latest
        InterestRate latestA = latestRates.stream()
                .filter(r -> r.getType().equals("A"))
                .findFirst().orElse(null);
        assertNotNull(latestA);
        assertEquals(2.0, latestA.getPercentage());

        // type B latest
        InterestRate latestB = latestRates.stream()
                .filter(r -> r.getType().equals("B"))
                .findFirst().orElse(null);
        assertNotNull(latestB);
        assertEquals(3.0, latestB.getPercentage());
    }

    @Test
    @DisplayName("Should find all rates by type ordered by timestamp desc")
    void testFindByTypeOrderByTimestampDesc() {
        List<InterestRate> ratesA = interestRateRepository.findByTypeOrderByTimestampDesc("A");
        assertEquals(2, ratesA.size());
        assertEquals(2.0, ratesA.get(0).getPercentage());
        assertEquals(1.5, ratesA.get(1).getPercentage());

        List<InterestRate> ratesB = interestRateRepository.findByTypeOrderByTimestampDesc("B");
        assertEquals(1, ratesB.size());
        assertEquals(3.0, ratesB.get(0).getPercentage());
    }

    @Test
    @DisplayName("Should find top (latest) rate by type")
    void testFindTopByTypeOrderByTimestampDesc() {
        InterestRate topA = interestRateRepository.findTopByTypeOrderByTimestampDesc("A");
        assertNotNull(topA);
        assertEquals(2.0, topA.getPercentage());

        InterestRate topB = interestRateRepository.findTopByTypeOrderByTimestampDesc("B");
        assertNotNull(topB);
        assertEquals(3.0, topB.getPercentage());
    }

    @Test
    @DisplayName("Should return null if type not exists")
    void testFindTopByTypeOrderByTimestampDescNotExist() {
        InterestRate topC = interestRateRepository.findTopByTypeOrderByTimestampDesc("C");
        assertNull(topC);
    }
}
