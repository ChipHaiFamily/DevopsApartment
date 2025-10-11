package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.Payment;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class PaymentRepositoryIntegrationTest {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private EntityManager entityManager;

    @BeforeEach
    void setUp() {
        Payment payment1 = Payment.builder()
                .paymentId("PAY-001")
                .amount(BigDecimal.valueOf(1000))
                .paymentDate(LocalDate.now().minusDays(2))
                .build();

        Payment payment2 = Payment.builder()
                .paymentId("PAY-002")
                .amount(BigDecimal.valueOf(1500))
                .paymentDate(LocalDate.now())
                .build();

        entityManager.persist(payment1);
        entityManager.persist(payment2);
        entityManager.flush();
    }

    @Test
    @DisplayName("Should find latest payment by paymentId desc")
    void testFindTopByOrderByPaymentIdDesc() {
        Optional<Payment> latest = paymentRepository.findTopByOrderByPaymentIdDesc();
        assertTrue(latest.isPresent());
        assertEquals("PAY-002", latest.get().getPaymentId());
    }

    @Test
    @DisplayName("Should sum revenue between dates")
    void testSumRevenueByDateBetween() {
        BigDecimal sum = paymentRepository.sumRevenueByDateBetween(
                LocalDate.now().minusDays(3),
                LocalDate.now()
        );
        assertTrue(sum.compareTo(BigDecimal.valueOf(2500)) == 0, "Sum should be 2500"); // 1000 + 1500
    }
}
