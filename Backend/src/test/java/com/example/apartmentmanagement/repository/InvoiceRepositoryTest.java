package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.Invoice;
import com.example.apartmentmanagement.model.Tenant;
import com.example.apartmentmanagement.model.User;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class InvoiceRepositoryTest {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private EntityManager entityManager;

    private Tenant tenant1;
    private Tenant tenant2;

    @BeforeEach
    void setUp() {
        // Create Users
        User user1 = User.builder()
                .id("USR-001")
                .fullName("User One")
                .email("user1@example.com")
                .passwd("pass")
                .build();
        entityManager.persist(user1);

        User user2 = User.builder()
                .id("USR-002")
                .fullName("User Two")
                .email("user2@example.com")
                .passwd("pass")
                .build();
        entityManager.persist(user2);

        // Create Tenants
        tenant1 = Tenant.builder()
                .user(user1)
                .citizenId("1100100123456")
                .emergencyContact("0898765432")
                .emergencyName("Somying")
                .emergencyRelationship("Mother")
                .build();
        entityManager.persist(tenant1);

        tenant2 = Tenant.builder()
                .user(user2)
                .citizenId("1100100654321")
                .emergencyContact("0891234567")
                .emergencyName("Somsri")
                .emergencyRelationship("Father")
                .build();
        entityManager.persist(tenant2);

        // Create Invoices
        Invoice inv1 = Invoice.builder()
                .invoiceId("INV-001")
                .tenant(tenant1)
                .totalAmount(BigDecimal.valueOf(1000))
                .status("unpaid")
                .issueDate(LocalDate.now().minusDays(10))
                .build();

        Invoice inv2 = Invoice.builder()
                .invoiceId("INV-002")
                .tenant(tenant1)
                .totalAmount(BigDecimal.valueOf(500))
                .status("paid")
                .issueDate(LocalDate.now().minusDays(5))
                .build();

        Invoice inv3 = Invoice.builder()
                .invoiceId("INV-003")
                .tenant(tenant2)
                .totalAmount(BigDecimal.valueOf(2000))
                .status("unpaid")
                .issueDate(LocalDate.now().minusDays(2))
                .build();

        entityManager.persist(inv1);
        entityManager.persist(inv2);
        entityManager.persist(inv3);

        entityManager.flush();
    }

    @Test
    @DisplayName("Should find the latest invoice by invoiceId")
    void testFindTopByOrderByInvoiceIdDesc() {
        Optional<Invoice> latest = invoiceRepository.findTopByOrderByInvoiceIdDesc();
        assertTrue(latest.isPresent());
        assertEquals("INV-003", latest.get().getInvoiceId());
    }

    @Test
    @DisplayName("Should find invoices by tenant ID")
    void testFindByTenantTenantId() {
        List<Invoice> invoices = invoiceRepository.findByTenantTenantId("USR-001");
        assertEquals(2, invoices.size());
    }

    @Test
    @DisplayName("Should calculate total unpaid by tenant")
    void testFindTotalUnpaidByTenant() {
        BigDecimal totalUnpaid = invoiceRepository.findTotalUnpaidByTenant("USR-001");
        assertEquals(0, totalUnpaid.compareTo(BigDecimal.valueOf(1000)));
    }

    @Test
    @DisplayName("Should calculate total expenses by tenant")
    void testFindTotalExpensesByTenant() {
        Double totalExpenses = invoiceRepository.findTotalExpensesByTenant("USR-001");
        assertEquals(1500, totalExpenses);
    }
}