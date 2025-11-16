package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.PaymentSlip;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class PaymentSlipRepositoryTest {

    @Autowired
    private PaymentSlipRepository paymentSlipRepository;

    @Autowired
    private EntityManager entityManager;

    private PaymentSlip slip1;
    private PaymentSlip slip2;
    private PaymentSlip slip3;

    @BeforeEach
    void setUp() {
        // Payment slips for paymentId "PAY-001"
        slip1 = new PaymentSlip();
        slip1.setPaymentId("PAY-001");
        slip1.setFileName("slip1.jpg");
        slip1.setUploadedAt(LocalDateTime.now().minusDays(2));
        slip1.setSlipData(new byte[]{1,2,3}); // <-- เพิ่มตรงนี้
        entityManager.persist(slip1);

        slip2 = new PaymentSlip();
        slip2.setPaymentId("PAY-001");
        slip2.setFileName("slip2.jpg");
        slip2.setUploadedAt(LocalDateTime.now().minusDays(1));
        slip2.setSlipData(new byte[]{4,5,6}); // <-- เพิ่มตรงนี้
        entityManager.persist(slip2);

        // Payment slip for another paymentId
        slip3 = new PaymentSlip();
        slip3.setPaymentId("PAY-002");
        slip3.setFileName("slip3.jpg");
        slip3.setUploadedAt(LocalDateTime.now());
        slip3.setSlipData(new byte[]{7,8,9}); // <-- เพิ่มตรงนี้
        entityManager.persist(slip3);

        entityManager.flush();
    }

    @Test
    @DisplayName("Should find all slips by paymentId")
    void testFindByPaymentId() {
        List<PaymentSlip> slips = paymentSlipRepository.findByPaymentId("PAY-001");
        assertEquals(2, slips.size());
        assertTrue(slips.stream().anyMatch(s -> s.getFileName().equals("slip1.jpg")));
        assertTrue(slips.stream().anyMatch(s -> s.getFileName().equals("slip2.jpg")));
    }

    @Test
    @DisplayName("Should find top slip by paymentId ordered by uploadedAt desc")
    void testFindTopByPaymentIdOrderByUploadedAtDesc() {
        Optional<PaymentSlip> latestSlip = paymentSlipRepository.findTopByPaymentIdOrderByUploadedAtDesc("PAY-001");
        assertTrue(latestSlip.isPresent());
        assertEquals("slip2.jpg", latestSlip.get().getFileName());
    }

    @Test
    @DisplayName("Should return empty list if paymentId not found")
    void testFindByPaymentIdNotFound() {
        List<PaymentSlip> slips = paymentSlipRepository.findByPaymentId("PAY-999");
        assertTrue(slips.isEmpty());
    }

    @Test
    @DisplayName("Should return empty optional if top slip not found")
    void testFindTopByPaymentIdOrderByUploadedAtDescNotFound() {
        Optional<PaymentSlip> latestSlip = paymentSlipRepository.findTopByPaymentIdOrderByUploadedAtDesc("PAY-999");
        assertFalse(latestSlip.isPresent());
    }
}
