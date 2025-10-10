package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.InvoiceDetailDto;
import com.example.apartmentmanagement.dto.InvoiceUpdateDTO;
import com.example.apartmentmanagement.exception.ResourceNotFoundException;
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
    private IdGenerationService idGenService;

    @InjectMocks
    private InvoiceService invoiceService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void create_generatesInvoiceIdPattern() {
        Invoice invoice = new Invoice();
        when(idGenService.generateInvoiceId()).thenReturn("INV-2025-10-001");
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
        when(idGenService.generatePaymentId()).thenReturn("PAY-2025-001");
        when(invoiceRepo.save(invoice)).thenReturn(invoice);

        Invoice updated = invoiceService.updateFromDto("INV-2025-001", dto);

        assertEquals("Partial", updated.getStatus());
        assertEquals(1, updated.getPayments().size());
        assertTrue(updated.getPayments().get(0).getPaymentId().matches("PAY-\\d{4}-\\d{3}"));
    }

    @Test
    void updateFromDto_createsInvoiceItemsFromDto() {
        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-2025-001");
        invoice.setTotalAmount(BigDecimal.valueOf(1000));

        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-001");

        InvoiceUpdateDTO dto = new InvoiceUpdateDTO();
        dto.setIssueDate(LocalDate.now());
        dto.setDueDate(LocalDate.now().plusDays(7));
        dto.setTotalAmount(BigDecimal.valueOf(1000));

        InvoiceUpdateDTO.TenantDTO tenantDTO = new InvoiceUpdateDTO.TenantDTO();
        tenantDTO.setTenantId("USR-001");
        dto.setTenant(tenantDTO);

        InvoiceUpdateDTO.ItemDTO itemDTO = new InvoiceUpdateDTO.ItemDTO();
        itemDTO.setDescription("Water");
        itemDTO.setAmount(BigDecimal.valueOf(100));
        dto.setItems(List.of(itemDTO));

        dto.setPayments(new ArrayList<>());

        when(invoiceRepo.findById("INV-2025-001")).thenReturn(Optional.of(invoice));
        when(tenantRepo.findById("USR-001")).thenReturn(Optional.of(tenant));
        when(invoiceRepo.save(invoice)).thenReturn(invoice);

        Invoice updated = invoiceService.updateFromDto("INV-2025-001", dto);

        assertEquals(1, updated.getItems().size());
        assertEquals("Water", updated.getItems().get(0).getDescription());
        assertEquals(BigDecimal.valueOf(100), updated.getItems().get(0).getAmount());
        assertEquals(invoice, updated.getItems().get(0).getInvoice());
    }

    @Test
    void updateFromDto_updatesExistingPayment() {
        Payment existingPayment = new Payment();
        existingPayment.setPaymentId("PAY-2025-001");
        existingPayment.setAmount(BigDecimal.valueOf(100));
        existingPayment.setMethod("Cash");

        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-2025-001");
        invoice.setTotalAmount(BigDecimal.valueOf(200));
        invoice.setPayments(new ArrayList<>(List.of(existingPayment)));

        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-001");

        InvoiceUpdateDTO dto = new InvoiceUpdateDTO();
        dto.setIssueDate(LocalDate.now());
        dto.setDueDate(LocalDate.now().plusDays(10));
        dto.setTotalAmount(BigDecimal.valueOf(200));

        InvoiceUpdateDTO.TenantDTO tenantDTO = new InvoiceUpdateDTO.TenantDTO();
        tenantDTO.setTenantId("USR-001");
        dto.setTenant(tenantDTO);

        InvoiceUpdateDTO.PaymentDTO paymentDTO = new InvoiceUpdateDTO.PaymentDTO();
        paymentDTO.setPaymentId("PAY-2025-001"); // same ID
        paymentDTO.setPaymentDate(LocalDate.now().toString());
        paymentDTO.setAmount(BigDecimal.valueOf(150)); // new amount
        paymentDTO.setMethod("Bank Transfer");
        dto.setPayments(List.of(paymentDTO));
        dto.setItems(new ArrayList<>());

        when(invoiceRepo.findById("INV-2025-001")).thenReturn(Optional.of(invoice));
        when(tenantRepo.findById("USR-001")).thenReturn(Optional.of(tenant));
        when(invoiceRepo.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Invoice updated = invoiceService.updateFromDto("INV-2025-001", dto);

        assertEquals(1, updated.getPayments().size());
        Payment p = updated.getPayments().get(0);
        assertEquals("PAY-2025-001", p.getPaymentId());
        assertEquals(BigDecimal.valueOf(150), p.getAmount()); // confirm update
        assertEquals("Bank Transfer", p.getMethod());
    }

    @Test
    void updateFromDto_setsPendingWhenNoPayment() {
        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-2025-001");
        invoice.setTotalAmount(BigDecimal.valueOf(500));
        invoice.setPayments(new ArrayList<>());

        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-001");

        InvoiceUpdateDTO dto = new InvoiceUpdateDTO();
        dto.setIssueDate(LocalDate.now());
        dto.setDueDate(LocalDate.now().plusDays(5));
        dto.setTotalAmount(BigDecimal.valueOf(500));
        InvoiceUpdateDTO.TenantDTO tenantDTO = new InvoiceUpdateDTO.TenantDTO();
        tenantDTO.setTenantId("USR-001");
        dto.setTenant(tenantDTO);
        dto.setPayments(new ArrayList<>());
        dto.setItems(new ArrayList<>());

        when(invoiceRepo.findById("INV-2025-001")).thenReturn(Optional.of(invoice));
        when(tenantRepo.findById("USR-001")).thenReturn(Optional.of(tenant));
        when(invoiceRepo.save(invoice)).thenReturn(invoice);

        Invoice updated = invoiceService.updateFromDto("INV-2025-001", dto);

        assertEquals("Pending", updated.getStatus());
    }

    @Test
    void updateFromDto_setsPaidWhenFullyPaid() {
        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-2025-001");
        invoice.setTotalAmount(BigDecimal.valueOf(300));
        invoice.setPayments(new ArrayList<>());

        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-001");

        InvoiceUpdateDTO dto = new InvoiceUpdateDTO();
        dto.setIssueDate(LocalDate.now());
        dto.setDueDate(LocalDate.now().plusDays(3));
        dto.setTotalAmount(BigDecimal.valueOf(300));

        InvoiceUpdateDTO.TenantDTO tenantDTO = new InvoiceUpdateDTO.TenantDTO();
        tenantDTO.setTenantId("USR-001");
        dto.setTenant(tenantDTO);

        InvoiceUpdateDTO.PaymentDTO paymentDTO = new InvoiceUpdateDTO.PaymentDTO();
        paymentDTO.setPaymentDate(LocalDate.now().toString());
        paymentDTO.setAmount(BigDecimal.valueOf(300)); // ชำระครบ
        paymentDTO.setMethod("Card");
        dto.setPayments(List.of(paymentDTO));
        dto.setItems(new ArrayList<>());

        when(invoiceRepo.findById("INV-2025-001")).thenReturn(Optional.of(invoice));
        when(tenantRepo.findById("USR-001")).thenReturn(Optional.of(tenant));
        when(idGenService.generatePaymentId()).thenReturn("PAY-2025-001");
        when(invoiceRepo.save(invoice)).thenReturn(invoice);

        Invoice updated = invoiceService.updateFromDto("INV-2025-001", dto);

        assertEquals("Paid", updated.getStatus());
    }

    @Test
    void toInvoiceDetailDto_handlesNullContractGracefully() {
        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-002");
        tenant.setContract(Collections.emptyList());

        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-2025-002");
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(10));
        invoice.setTotalAmount(BigDecimal.valueOf(100));
        invoice.setStatus("Pending");
        invoice.setTenant(tenant);
        invoice.setItems(new ArrayList<>());
        invoice.setPayments(new ArrayList<>());

        InvoiceDetailDto dto = invoiceService.toInvoiceDetailDto(invoice);

        assertNull(dto.getContractStatus());
        assertNull(dto.getRoomNum());
        assertNull(dto.getFloor());
    }


    @Test
    void findAll_returnsList() {
        when(invoiceRepo.findAll()).thenReturn(List.of(new Invoice(), new Invoice()));
        List<Invoice> result = invoiceService.findAll();
        assertEquals(2, result.size());
    }

    @Test
    void findById_returnsInvoice() {
        Invoice invoice = new Invoice();
        when(invoiceRepo.findById("INV-2025-001")).thenReturn(Optional.of(invoice));
        Optional<Invoice> found = invoiceService.findById("INV-2025-001");
        assertTrue(found.isPresent());
        assertEquals(invoice, found.get());
    }

    @Test
    void save_callsRepoSave() {
        Invoice invoice = new Invoice();
        when(invoiceRepo.save(invoice)).thenReturn(invoice);
        Invoice result = invoiceService.save(invoice);
        assertEquals(invoice, result);
    }

    @Test
    void deleteById_callsRepoDelete() {
        invoiceService.deleteById("INV-2025-001");
        verify(invoiceRepo, times(1)).deleteById("INV-2025-001");
    }

    @Test
    void countOutstandingInvoices_countsUnpaid() {
        Invoice i1 = new Invoice(); i1.setStatus("Pending");
        Invoice i2 = new Invoice(); i2.setStatus("Paid");
        Invoice i3 = new Invoice(); i3.setStatus("Partial");
        when(invoiceRepo.findAll()).thenReturn(List.of(i1, i2, i3));

        int count = invoiceService.countOutstandingInvoices();
        assertEquals(2, count);
    }

    @Test
    void getOutstandingInvoices_returnsOnlyUnpaid() {
        Invoice i1 = new Invoice(); i1.setStatus("Paid");
        Invoice i2 = new Invoice(); i2.setStatus("Pending");
        when(invoiceRepo.findAll()).thenReturn(List.of(i1, i2));

        List<Invoice> list = invoiceService.getOutstandingInvoices();
        assertEquals(1, list.size());
        assertEquals("Pending", list.get(0).getStatus());
    }

    @Test
    void getRevenueThisMonth_sumsPaidInvoices() {
        LocalDate now = LocalDate.now();

        Invoice i1 = new Invoice();
        i1.setStatus("PAID");
        i1.setIssueDate(now);
        i1.setTotalAmount(BigDecimal.valueOf(300));

        Invoice i2 = new Invoice();
        i2.setStatus("Pending");
        i2.setIssueDate(now);
        i2.setTotalAmount(BigDecimal.valueOf(200));

        Invoice i3 = new Invoice();
        i3.setStatus("PAID");
        i3.setIssueDate(now.minusMonths(1));
        i3.setTotalAmount(BigDecimal.valueOf(100));

        when(invoiceRepo.findAll()).thenReturn(List.of(i1, i2, i3));

        BigDecimal result = invoiceService.getRevenueThisMonth();
        assertEquals(BigDecimal.valueOf(300), result);
    }

    @Test
    void getAllInvoices_returnsAll() {
        when(invoiceRepo.findAll()).thenReturn(List.of(new Invoice(), new Invoice()));
        assertEquals(2, invoiceService.getAllInvoices().size());
    }

    @Test
    void getInvoiceById_found() {
        Invoice invoice = new Invoice();
        when(invoiceRepo.findById("INV-2025-001")).thenReturn(Optional.of(invoice));
        Invoice found = invoiceService.getInvoiceById("INV-2025-001");
        assertEquals(invoice, found);
    }

    @Test
    void getInvoiceById_notFoundThrows() {
        when(invoiceRepo.findById("INV-2025-999")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> invoiceService.getInvoiceById("INV-2025-999"));
    }

    @Test
    void toInvoiceDetailDto_returnsExpectedDto() {
        // ----- Mock Room -----
        Room room = new Room();
        room.setRoomNum("301");
        room.setFloor(3);

        Contract contract = new Contract();
        contract.setStartDate(LocalDate.of(2025, 1, 1));
        contract.setStatus("Active");
        contract.setRoom(room);

        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-001");
        tenant.setContract(List.of(contract));

        InvoiceItem item = new InvoiceItem();
        item.setDescription("Electricity");
        item.setAmount(BigDecimal.valueOf(1200));

        Payment payment = new Payment();
        payment.setPaymentId("PAY-2025-001");
        payment.setPaymentDate(LocalDate.now());
        payment.setAmount(BigDecimal.valueOf(1200));
        payment.setMethod("Cash");

        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-2025-001");
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(5));
        invoice.setTotalAmount(BigDecimal.valueOf(1200));
        invoice.setStatus("Paid");
        invoice.setTenant(tenant);
        invoice.setItems(List.of(item));
        invoice.setPayments(List.of(payment));

        var dto = invoiceService.toInvoiceDetailDto(invoice);

        assertEquals("INV-2025-001", dto.getInvoiceId());
        assertEquals("Paid", dto.getStatus());
        assertEquals("USR-001", dto.getTenantId());
        assertEquals("Active", dto.getContractStatus());
        assertEquals("301", dto.getRoomNum());
        assertEquals(3, dto.getFloor());
        assertEquals(1, dto.getItems().size());
        assertEquals(1, dto.getPayments().size());
        assertEquals("Electricity", dto.getItems().get(0).getDescription());
        assertEquals("Cash", dto.getPayments().get(0).getMethod());
    }

}
