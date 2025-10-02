package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.MaintenanceLog;
import com.example.apartmentmanagement.repository.MaintenanceLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

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
}
