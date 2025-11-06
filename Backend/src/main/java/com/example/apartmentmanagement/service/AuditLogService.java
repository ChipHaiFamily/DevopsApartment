package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.AuditLog;
import com.example.apartmentmanagement.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository repository;

    public List<AuditLog> getByPeriod(String period) {
        LocalDate start = LocalDate.parse(period + "-01");
        LocalDate end = start.plusMonths(1);
        return repository.findByActionTimeBetween(start.atStartOfDay(), end.atStartOfDay());
    }
}
