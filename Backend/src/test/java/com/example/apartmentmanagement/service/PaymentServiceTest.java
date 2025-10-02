package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.Payment;
import com.example.apartmentmanagement.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepo;

    @InjectMocks
    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findAll_returnsAllPayments() {
        Payment p1 = new Payment();
        Payment p2 = new Payment();
        when(paymentRepo.findAll()).thenReturn(List.of(p1, p2));

        List<Payment> result = paymentService.findAll();
        assertEquals(2, result.size());
    }

    @Test
    void findById_returnsOptionalPayment() {
        Payment p = new Payment();
        p.setPaymentId("PAY-2025-001");
        when(paymentRepo.findById("PAY-2025-001")).thenReturn(Optional.of(p));

        Optional<Payment> result = paymentService.findById("PAY-2025-001");
        assertTrue(result.isPresent());
        assertEquals("PAY-2025-001", result.get().getPaymentId());
    }

    @Test
    void save_returnsSavedPayment() {
        Payment p = new Payment();
        when(paymentRepo.save(p)).thenReturn(p);

        Payment saved = paymentService.save(p);
        assertNotNull(saved);
    }

    @Test
    void deleteById_invokesRepository() {
        paymentService.deleteById("PAY-2025-001");
        verify(paymentRepo, times(1)).deleteById("PAY-2025-001");
    }
}
