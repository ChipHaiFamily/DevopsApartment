// InvoiceRepository.java
package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.invoice.invoiceId = :invoiceId")
    BigDecimal sumByInvoiceId(@Param("invoiceId") String invoiceId);

    Optional<Invoice> findTopByOrderByInvoiceIdDesc();

    List<Invoice> findByTenantTenantId(String tenantId);

    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.tenant.tenantId = :tenantId AND i.status = 'unpaid'")
    BigDecimal findTotalUnpaidByTenant(@Param("tenantId") String tenantId);

    Page<Invoice> findByStatus(String status, Pageable pageable);

    @Query("SELECT i FROM Invoice i " +
            "WHERE i.tenant.tenantId = :tenantId " +
            "AND i.issueDate >= :startDate " +
            "ORDER BY i.issueDate DESC")
    List<Invoice> findRecentInvoicesByTenant(@Param("tenantId") String tenantId,
                                             @Param("startDate") java.time.LocalDate startDate);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.tenant.tenantId = :tenantId")
    Double findTotalExpensesByTenant(@Param("tenantId") String tenantId);

    @Query("SELECT COALESCE(SUM(inv.totalAmount), 0) FROM Invoice inv WHERE inv.issueDate BETWEEN :start AND :end")
    Double sumRevenueByDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

}
