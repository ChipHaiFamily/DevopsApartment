package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.AuditLog;
import com.example.apartmentmanagement.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository repository;

    public List<AuditLog> getByPeriod(String period) {
        return repository.findByPeriod(period);
    }
}
