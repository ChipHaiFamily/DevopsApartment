package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE TO_CHAR(a.createdAt, 'YYYY-MM') = :period ORDER BY a.createdAt DESC")
    List<AuditLog> findByPeriod(String period);
}
