package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.MaintenanceLog;
import com.example.apartmentmanagement.repository.MaintenanceLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MaintenanceLogServiceTest {

    @Mock
    private MaintenanceLogRepository logRepo;

    @Mock
    private IdGenerationService idGenService;

    @InjectMocks
    private MaintenanceLogService logService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findAll_returnsAllLogs() {
        MaintenanceLog log1 = new MaintenanceLog();
        MaintenanceLog log2 = new MaintenanceLog();
        when(logRepo.findAll()).thenReturn(List.of(log1, log2));

        List<MaintenanceLog> result = logService.findAll();
        assertEquals(2, result.size());
    }

    @Test
    void findById_returnsOptionalLog() {
        MaintenanceLog log = new MaintenanceLog();
        log.setLogId("ML-2025-001");
        when(logRepo.findById("ML-2025-001")).thenReturn(Optional.of(log));

        Optional<MaintenanceLog> result = logService.findById("ML-2025-001");
        assertTrue(result.isPresent());
        assertEquals("ML-2025-001", result.get().getLogId());
    }

    @Test
    void save_returnsSavedLog() {
        MaintenanceLog log = new MaintenanceLog();
        when(logRepo.save(log)).thenReturn(log);

        MaintenanceLog saved = logService.save(log);
        assertNotNull(saved);
    }

    @Test
    void deleteById_invokesRepository() {
        logService.deleteById("ML-2025-001");
        verify(logRepo, times(1)).deleteById("ML-2025-001");
    }

    @Test
    void countOpenTasks_countsNonCompletedLogs() {
        MaintenanceLog log1 = new MaintenanceLog();
        log1.setStatus("open");
        MaintenanceLog log2 = new MaintenanceLog();
        log2.setStatus("completed");
        MaintenanceLog log3 = new MaintenanceLog();
        log3.setStatus("pending");

        when(logRepo.findAll()).thenReturn(List.of(log1, log2, log3));

        int count = logService.countOpenTasks();
        assertEquals(2, count);
    }

    @Test
    void getOpenTasks_returnsNonCompletedLogs() {
        MaintenanceLog log1 = new MaintenanceLog();
        log1.setStatus("open");
        MaintenanceLog log2 = new MaintenanceLog();
        log2.setStatus("completed");

        when(logRepo.findAll()).thenReturn(List.of(log1, log2));

        List<MaintenanceLog> openTasks = logService.getOpenTasks();
        assertEquals(1, openTasks.size());
        assertEquals("open", openTasks.get(0).getStatus());
    }


    @Test
    void create_generatesLogIdPattern() {
        MaintenanceLog log = new MaintenanceLog();
        when(idGenService.generateMtncLogId()).thenReturn("ML-" + Calendar.getInstance().get(Calendar.YEAR) + "-001");
        when(logRepo.save(log)).thenReturn(log);

        MaintenanceLog created = logService.create(log);
        assertNotNull(created.getLogId());
        assertTrue(created.getLogId().matches("ML-\\d{4}-\\d{3}"));
    }

    @Test
    void getRecentTasks_returnsTop5SortedByRequestDate() {
        LocalDate now = LocalDate.now();
        List<MaintenanceLog> logs = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            MaintenanceLog log = new MaintenanceLog();
            log.setRequestDate(now.minusDays(i));
            logs.add(log);
        }
        when(logRepo.findAll()).thenReturn(logs);

        List<MaintenanceLog> recent = logService.getRecentTasks();
        assertEquals(5, recent.size());
        for (int i = 0; i < recent.size() - 1; i++) {
            assertTrue(!recent.get(i).getRequestDate().isBefore(recent.get(i + 1).getRequestDate()));
        }
    }

    @Test
    void getRecentTasks_ignoresLogsOlderThan30Days() {
        LocalDate now = LocalDate.now();
        MaintenanceLog oldLog = new MaintenanceLog();
        oldLog.setRequestDate(now.minusDays(40));

        MaintenanceLog recentLog = new MaintenanceLog();
        recentLog.setRequestDate(now.minusDays(5));

        when(logRepo.findAll()).thenReturn(List.of(oldLog, recentLog));

        List<MaintenanceLog> recent = logService.getRecentTasks();
        assertEquals(1, recent.size());
        assertEquals(recentLog, recent.get(0));
    }

    @Test
    void getOpenTasks_returnsEmptyWhenAllCompleted() {
        MaintenanceLog log1 = new MaintenanceLog(); log1.setStatus("COMPLETED");
        MaintenanceLog log2 = new MaintenanceLog(); log2.setStatus("COMPLETED");
        when(logRepo.findAll()).thenReturn(List.of(log1, log2));

        List<MaintenanceLog> openTasks = logService.getOpenTasks();
        assertTrue(openTasks.isEmpty());
    }

    @Test
    void countOpenTasks_returnsZeroWhenNoLogs() {
        when(logRepo.findAll()).thenReturn(Collections.emptyList());
        assertEquals(0, logService.countOpenTasks());
    }

}
