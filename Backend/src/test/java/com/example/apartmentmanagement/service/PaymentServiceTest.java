package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.PaymentDashboardDto;
import com.example.apartmentmanagement.exception.ResourceNotFoundException;
import com.example.apartmentmanagement.model.*;
import com.example.apartmentmanagement.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentServiceTest {

    @Mock private PaymentRepository paymentRepo;
    @Mock private InvoiceRepository invoiceRepo;
    @Mock private ContractRepository contractRepo;
    @Mock private PaymentSlipRepository slipRepo;
    @Mock private IdGenerationService idGenService;

    @InjectMocks private PaymentService paymentService;

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
        p.setPaymentId("PAY-001");
        when(paymentRepo.findById("PAY-001")).thenReturn(Optional.of(p));

        Optional<Payment> result = paymentService.findById("PAY-001");
        assertTrue(result.isPresent());
        assertEquals("PAY-001", result.get().getPaymentId());
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
        paymentService.deleteById("PAY-001");
        verify(paymentRepo, times(1)).deleteById("PAY-001");
    }

    @Test
    void create_setsIdAndSavesPayment() {
        Tenant tenant = new Tenant();
        tenant.setTenantId("T-001");
        User user = new User();
        user.setFullName("Alice");
        tenant.setUser(user);

        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-001");
        InvoiceItem item = InvoiceItem.builder()
                .amount(BigDecimal.valueOf(100))
                .description("Test item")
                .invoice(invoice)
                .build();
        invoice.setTenant(tenant);
        invoice.setItems(List.of(item));

        invoice.setPayments(new ArrayList<>());

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setAmount(BigDecimal.valueOf(50));

        invoice.getPayments().add(payment);

        when(invoiceRepo.findById("INV-001")).thenReturn(Optional.of(invoice));
        when(idGenService.generatePaymentId()).thenReturn("PAY-001");
        when(paymentRepo.save(any())).thenAnswer(i -> i.getArgument(0));
        when(invoiceRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        Payment saved = paymentService.create(payment);

        assertEquals("PAY-001", saved.getPaymentId());
        assertEquals(invoice, saved.getInvoice());
        assertEquals("Partial", invoice.getStatus());
    }

    @Test
    void getPaymentById_returnsDto() {
        Tenant tenant = new Tenant();
        User user = new User();
        user.setFullName("Alice");
        tenant.setUser(user);
        tenant.setTenantId("T-001");

        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-001");
        invoice.setTenant(tenant);

        Payment payment = new Payment();
        payment.setPaymentId("PAY-001");
        payment.setInvoice(invoice);

        when(paymentRepo.findById("PAY-001")).thenReturn(Optional.of(payment));
        when(contractRepo.findActiveContractsByTenant("T-001")).thenReturn(List.of(new Contract() {{
            setRoom(new Room() {{ setRoomNum("101"); }});
        }}));
        when(slipRepo.findTopByPaymentIdOrderByUploadedAtDesc("PAY-001")).thenReturn(Optional.empty());

        PaymentDashboardDto dto = paymentService.getPaymentById("PAY-001");
        assertEquals("PAY-001", dto.getPaymentId());
        assertEquals("INV-001", dto.getInvoiceId());
        assertEquals("101", dto.getRoomNum());
        assertEquals("Alice", dto.getTenantName());
        assertNull(dto.getSlipBase64());
    }

    @Test
    void getAllPayments_returnsDtoList() {
        Payment p = new Payment();
        p.setPaymentId("PAY-001");
        Invoice invoice = new Invoice();
        Tenant tenant = new Tenant();
        User user = new User();
        user.setFullName("Alice");
        tenant.setUser(user);
        tenant.setTenantId("T-001");
        invoice.setTenant(tenant);
        p.setInvoice(invoice);

        when(paymentRepo.findAllByOrderByPaymentDateDesc()).thenReturn(List.of(p));
        when(contractRepo.findActiveContractsByTenant("T-001")).thenReturn(List.of(new Contract() {{
            setRoom(new Room() {{ setRoomNum("101"); }});
        }}));
        when(slipRepo.findTopByPaymentIdOrderByUploadedAtDesc("PAY-001")).thenReturn(Optional.empty());

        List<PaymentDashboardDto> dtos = paymentService.getAllPayments();
        assertEquals(1, dtos.size());
        assertEquals("PAY-001", dtos.get(0).getPaymentId());
    }

    @Test
    void create_throwsExceptionWhenInvoiceNotFound() {
        Payment payment = new Payment();
        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-999");
        payment.setInvoice(invoice);

        when(invoiceRepo.findById("INV-999")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> paymentService.create(payment));
    }

    @Test
    void updateInvoiceStatus_setsPendingWhenNoPayment() {
        Invoice invoice = new Invoice();
        invoice.setItems(List.of(
                InvoiceItem.builder().amount(BigDecimal.valueOf(100)).build()
        ));
        invoice.setPayments(List.of());

        Payment payment = new Payment();
        payment.setInvoice(invoice);

        when(invoiceRepo.findById(any())).thenReturn(Optional.of(invoice));
        when(idGenService.generatePaymentId()).thenReturn("PAY-123");
        when(paymentRepo.save(any())).thenReturn(payment);
        when(invoiceRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        paymentService.create(payment);

        assertEquals("Pending", invoice.getStatus());
    }

    @Test
    void updateInvoiceStatus_setsPaidWhenFullyPaid() {
        Invoice invoice = new Invoice();
        invoice.setItems(List.of(
                InvoiceItem.builder().amount(BigDecimal.valueOf(100)).build()
        ));
        Payment payment = new Payment();
        payment.setAmount(BigDecimal.valueOf(100));
        invoice.setPayments(List.of(payment));

        when(invoiceRepo.findById(any())).thenReturn(Optional.of(invoice));
        when(idGenService.generatePaymentId()).thenReturn("PAY-123");
        when(paymentRepo.save(any())).thenReturn(payment);
        when(invoiceRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        paymentService.create(new Payment() {{ setInvoice(invoice); }});

        assertEquals("Paid", invoice.getStatus());
    }

    @Test
    void updateInvoiceStatus_setsPartialWhenPartiallyPaid() {
        Invoice invoice = new Invoice();
        invoice.setItems(List.of(
                InvoiceItem.builder().amount(BigDecimal.valueOf(100)).build()
        ));
        Payment payment = new Payment();
        payment.setAmount(BigDecimal.valueOf(50));
        invoice.setPayments(List.of(payment));

        when(invoiceRepo.findById(any())).thenReturn(Optional.of(invoice));
        when(idGenService.generatePaymentId()).thenReturn("PAY-123");
        when(paymentRepo.save(any())).thenReturn(payment);
        when(invoiceRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        paymentService.create(new Payment() {{ setInvoice(invoice); }});

        assertEquals("Partial", invoice.getStatus());
    }

    @Test
    void getPaymentById_throwsWhenNotFound() {
        when(paymentRepo.findById("PAY-999")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> paymentService.getPaymentById("PAY-999"));
    }

    @Test
    void toDto_includesSlipBase64WhenSlipExists() {
        Tenant tenant = new Tenant();
        User user = new User();
        user.setFullName("Bob");
        tenant.setUser(user);
        tenant.setTenantId("T-001");

        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-001");
        invoice.setTenant(tenant);

        Payment payment = new Payment();
        payment.setPaymentId("PAY-001");
        payment.setInvoice(invoice);

        PaymentSlip slip = new PaymentSlip();
        slip.setMimeType("image/png");
        slip.setSlipData("dummy".getBytes());

        when(contractRepo.findActiveContractsByTenant("T-001"))
                .thenReturn(List.of(new Contract() {{
                    setRoom(new Room() {{ setRoomNum("101"); }});
                }}));
        when(slipRepo.findTopByPaymentIdOrderByUploadedAtDesc("PAY-001")).thenReturn(Optional.of(slip));

        when(paymentRepo.findById("PAY-001")).thenReturn(Optional.of(payment));

        PaymentDashboardDto dto = paymentService.getPaymentById("PAY-001");

        assertEquals("PAY-001", dto.getPaymentId());
        assertEquals("INV-001", dto.getInvoiceId());
        assertEquals("101", dto.getRoomNum());
        assertEquals("Bob", dto.getTenantName());
        assertNotNull(dto.getSlipBase64());
        assertTrue(dto.getSlipBase64().startsWith("data:image/png;base64,"));
    }

}