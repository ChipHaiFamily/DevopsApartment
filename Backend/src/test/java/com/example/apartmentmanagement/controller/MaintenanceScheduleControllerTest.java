package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.MaintenanceSchedule;
import com.example.apartmentmanagement.service.MaintenanceScheduleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MaintenanceScheduleControllerTest {

    @Mock
    private MaintenanceScheduleService service;

    @InjectMocks
    private MaintenanceScheduleController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAll_returnsList() {
        MaintenanceSchedule schedule1 = new MaintenanceSchedule();
        MaintenanceSchedule schedule2 = new MaintenanceSchedule();
        when(service.findAll()).thenReturn(List.of(schedule1, schedule2));

        List<MaintenanceSchedule> result = controller.getAll();

        assertEquals(2, result.size());
        verify(service).findAll();
    }

    @Test
    void getById_returnsSchedule() {
        MaintenanceSchedule schedule = new MaintenanceSchedule();
        when(service.findById("SCH-001")).thenReturn(Optional.of(schedule));

        Optional<MaintenanceSchedule> result = controller.getById("SCH-001");

        assertTrue(result.isPresent());
        assertEquals(schedule, result.get());
        verify(service).findById("SCH-001");
    }

    @Test
    void create_savesSchedule() {
        MaintenanceSchedule schedule = new MaintenanceSchedule();
        when(service.create(schedule)).thenReturn(schedule);

        MaintenanceSchedule result = controller.create(schedule);

        assertEquals(schedule, result);
        verify(service).create(schedule);
    }

    @Test
    void update_setsIdAndSaves() {
        MaintenanceSchedule schedule = new MaintenanceSchedule();
        MaintenanceSchedule updatedSchedule = new MaintenanceSchedule();
        when(service.save(schedule)).thenReturn(updatedSchedule);

        MaintenanceSchedule result = controller.update("SCH-005", schedule);

        assertEquals(updatedSchedule, result);
        assertEquals("SCH-005", schedule.getScheduleId());
        verify(service).save(schedule);
    }

    @Test
    void delete_callsServiceDelete() {
        controller.delete("SCH-010");
        verify(service).deleteById("SCH-010");
    }
}
