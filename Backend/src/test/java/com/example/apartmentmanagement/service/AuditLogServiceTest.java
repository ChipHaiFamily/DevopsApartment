package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.AuditLog;
import com.example.apartmentmanagement.repository.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepo;

    @InjectMocks
    private AuditLogService auditLogService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getByPeriod_returnsAuditLogsWithinMonth() {
        String period = "2025-11";
        LocalDateTime start = LocalDateTime.parse("2025-11-01T00:00:00");
        LocalDateTime end = start.plusMonths(1);

        AuditLog log1 = new AuditLog();
        AuditLog log2 = new AuditLog();

        when(auditLogRepo.findByActionTimeBetween(start, end)).thenReturn(List.of(log1, log2));

        List<AuditLog> result = auditLogService.getByPeriod(period);

        assertEquals(2, result.size());
        assertTrue(result.contains(log1));
        assertTrue(result.contains(log2));
        verify(auditLogRepo, times(1)).findByActionTimeBetween(start, end);
    }

    @Test
    void getByPeriod_returnsEmptyListIfNoLogs() {
        String period = "2025-12";
        LocalDateTime start = LocalDateTime.parse("2025-12-01T00:00:00");
        LocalDateTime end = start.plusMonths(1);

        when(auditLogRepo.findByActionTimeBetween(start, end)).thenReturn(List.of());

        List<AuditLog> result = auditLogService.getByPeriod(period);

        assertTrue(result.isEmpty());
        verify(auditLogRepo, times(1)).findByActionTimeBetween(start, end);
    }

    @Test
    void getByPeriod_invalidPeriod_throwsException() {
        String invalidPeriod = "2025-13";
        assertThrows(Exception.class, () -> auditLogService.getByPeriod(invalidPeriod));
    }
}
