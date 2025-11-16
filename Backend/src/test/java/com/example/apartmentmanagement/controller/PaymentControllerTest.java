package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.Invoice;
import com.example.apartmentmanagement.model.Payment;
import com.example.apartmentmanagement.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentControllerTest {

    @Mock
    private PaymentService service;

    @InjectMocks
    private PaymentController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAll_returnsList() {
        Payment p1 = new Payment();
        Payment p2 = new Payment();
        when(service.findAll()).thenReturn(List.of(p1, p2));

        List<Payment> result = controller.getAll();

        assertEquals(2, result.size());
        verify(service).findAll();
    }

    @Test
    void getById_returnsPayment() {
        Payment p = new Payment();
        when(service.findById("PAY-001")).thenReturn(Optional.of(p));

        Optional<Payment> result = controller.getById("PAY-001");

        assertTrue(result.isPresent());
        assertEquals(p, result.get());
        verify(service).findById("PAY-001");
    }

    @Test
    void create_savesPayment() {
        // สร้าง Payment และ Invoice
        Payment p = new Payment();
        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-001");
        p.setInvoice(invoice);

        when(service.create(any(Payment.class))).thenAnswer(invocation -> {
            Payment arg = invocation.getArgument(0);
            arg.setPaymentId("PAY-001");
            return arg;
        });

        Payment result = controller.create(p);

        assertNotNull(result.getPaymentId());
        assertEquals(p.getInvoice(), result.getInvoice());

        verify(service).create(p);
    }

    @Test
    void update_setsIdAndSaves() {
        Payment p = new Payment();
        Payment updated = new Payment();
        when(service.save(p)).thenReturn(updated);

        Payment result = controller.update("PAY-005", p);

        assertEquals(updated, result);
        assertEquals("PAY-005", p.getPaymentId());
        verify(service).save(p);
    }

    @Test
    void delete_callsServiceDelete() {
        controller.delete("PAY-010");
        verify(service).deleteById("PAY-010");
    }
}
