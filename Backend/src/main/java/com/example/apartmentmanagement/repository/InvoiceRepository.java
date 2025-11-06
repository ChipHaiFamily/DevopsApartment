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

    Optional<Invoice> findTopByOrderByInvoiceIdDesc();

    List<Invoice> findByTenantTenantId(String tenantId);

    @Query("SELECT SUM(i.totalAmount) FROM Invoice i " +
            "WHERE i.tenant.tenantId = :tenantId " +
            "AND i.status != 'paid' " +
            "AND i.status != 'Carry_forward'")
    BigDecimal findTotalUnpaidByTenant(@Param("tenantId") String tenantId);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.tenant.tenantId = :tenantId")
    Double findTotalExpensesByTenant(@Param("tenantId") String tenantId);

}
