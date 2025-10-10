package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.MaintenanceLog;
import com.example.apartmentmanagement.service.MaintenanceLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MaintenanceLogControllerTest {

    @Mock
    private MaintenanceLogService maintenanceLogService;

    @InjectMocks
    private MaintenanceLogController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAll_returnsList() {
        MaintenanceLog log1 = new MaintenanceLog();
        MaintenanceLog log2 = new MaintenanceLog();
        when(maintenanceLogService.findAll()).thenReturn(List.of(log1, log2));

        List<MaintenanceLog> result = controller.getAll();

        assertEquals(2, result.size());
        verify(maintenanceLogService).findAll();
    }

    @Test
    void getById_returnsLog() {
        MaintenanceLog log = new MaintenanceLog();
        when(maintenanceLogService.findById("LOG-001")).thenReturn(Optional.of(log));

        Optional<MaintenanceLog> result = controller.getById("LOG-001");

        assertTrue(result.isPresent());
        assertEquals(log, result.get());
        verify(maintenanceLogService).findById("LOG-001");
    }

    @Test
    void create_savesLog() {
        MaintenanceLog log = new MaintenanceLog();
        when(maintenanceLogService.create(log)).thenReturn(log);

        MaintenanceLog result = controller.create(log);

        assertEquals(log, result);
        verify(maintenanceLogService).create(log);
    }

    @Test
    void update_setsIdAndSaves() {
        MaintenanceLog log = new MaintenanceLog();
        MaintenanceLog updatedLog = new MaintenanceLog();
        when(maintenanceLogService.save(log)).thenReturn(updatedLog);

        MaintenanceLog result = controller.update("LOG-005", log);

        assertEquals(updatedLog, result);
        assertEquals("LOG-005", log.getLogId());
        verify(maintenanceLogService).save(log);
    }

    @Test
    void delete_callsServiceDelete() {
        controller.delete("LOG-010");
        verify(maintenanceLogService).deleteById("LOG-010");
    }
}
