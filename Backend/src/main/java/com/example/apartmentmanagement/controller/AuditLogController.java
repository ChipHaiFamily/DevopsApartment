package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.AuditLog;
import com.example.apartmentmanagement.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService service;

    @GetMapping
    public List<AuditLog> getLogsByPeriod(@RequestParam String period) {
        return service.getByPeriod(period);
    }
}
