package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.InvoiceUpdateDTO;
import com.example.apartmentmanagement.model.*;
import com.example.apartmentmanagement.repository.InvoiceRepository;
import com.example.apartmentmanagement.repository.TenantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepo;
    @Mock
    private TenantRepository tenantRepo;
    @Mock
    private IdGenerationService idGenService; // mock ID generator

    @InjectMocks
    private InvoiceService invoiceService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void create_generatesInvoiceIdPattern() {
        Invoice invoice = new Invoice();

        when(idGenService.generateInvoiceId()).thenReturn("INV-" + LocalDate.now().getYear() + "-01-001");
        when(invoiceRepo.save(invoice)).thenReturn(invoice);

        Invoice created = invoiceService.create(invoice);

        assertEquals("Pending", created.getStatus());
        assertTrue(created.getInvoiceId().matches("INV-\\d{4}-\\d{2}-\\d{3}"));
    }

    @Test
    void updateFromDto_generatesPaymentIdPattern() {
        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-2025-001");
        invoice.setTotalAmount(BigDecimal.valueOf(500));
        invoice.setPayments(new ArrayList<>());

        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-001");

        InvoiceUpdateDTO dto = new InvoiceUpdateDTO();
        dto.setIssueDate(LocalDate.now());
        dto.setDueDate(LocalDate.now().plusDays(10));
        dto.setTotalAmount(BigDecimal.valueOf(500));

        InvoiceUpdateDTO.TenantDTO tenantDTO = new InvoiceUpdateDTO.TenantDTO();
        tenantDTO.setTenantId("USR-001");
        dto.setTenant(tenantDTO);

        InvoiceUpdateDTO.PaymentDTO paymentDTO = new InvoiceUpdateDTO.PaymentDTO();
        paymentDTO.setPaymentDate(LocalDate.now().toString());
        paymentDTO.setAmount(BigDecimal.valueOf(200));
        paymentDTO.setMethod("Cash");
        dto.setPayments(List.of(paymentDTO));
        dto.setItems(new ArrayList<>());

        when(invoiceRepo.findById("INV-2025-001")).thenReturn(Optional.of(invoice));
        when(tenantRepo.findById("USR-001")).thenReturn(Optional.of(tenant));

        when(idGenService.generatePaymentId()).thenReturn("PAY-" + LocalDate.now().getYear() + "-" + String.format("%02d", LocalDate.now().getMonthValue()) + "-001");
        when(invoiceRepo.save(invoice)).thenReturn(invoice);

        Invoice updated = invoiceService.updateFromDto("INV-2025-001", dto);

        assertEquals("Partial", updated.getStatus());
        assertEquals(1, updated.getPayments().size());
        assertTrue(updated.getPayments().get(0).getPaymentId().matches("PAY-\\d{4}-\\d{2}-\\d{3}"));
        assertEquals("USR-001", updated.getTenant().getTenantId());
    }
}