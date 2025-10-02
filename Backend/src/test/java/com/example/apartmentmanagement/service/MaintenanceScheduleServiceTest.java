package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.MaintenanceSchedule;
import com.example.apartmentmanagement.repository.MaintenanceScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MaintenanceScheduleServiceTest {

    @Mock
    private MaintenanceScheduleRepository scheduleRepo;

    @Mock
    private IdGenerationService idGenService;

    @InjectMocks
    private MaintenanceScheduleService scheduleService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findAll_returnsAllSchedules() {
        MaintenanceSchedule s1 = new MaintenanceSchedule();
        MaintenanceSchedule s2 = new MaintenanceSchedule();
        when(scheduleRepo.findAll()).thenReturn(List.of(s1, s2));

        List<MaintenanceSchedule> result = scheduleService.findAll();
        assertEquals(2, result.size());
    }

    @Test
    void findById_returnsOptionalSchedule() {
        MaintenanceSchedule s = new MaintenanceSchedule();
        s.setScheduleId("MS-2025-001");
        when(scheduleRepo.findById("MS-2025-001")).thenReturn(Optional.of(s));

        Optional<MaintenanceSchedule> result = scheduleService.findById("MS-2025-001");
        assertTrue(result.isPresent());
        assertEquals("MS-2025-001", result.get().getScheduleId());
    }

    @Test
    void save_returnsSavedSchedule() {
        MaintenanceSchedule s = new MaintenanceSchedule();
        when(scheduleRepo.save(s)).thenReturn(s);

        MaintenanceSchedule saved = scheduleService.save(s);
        assertNotNull(saved);
    }

    @Test
    void deleteById_invokesRepository() {
        scheduleService.deleteById("MS-2025-001");
        verify(scheduleRepo, times(1)).deleteById("MS-2025-001");
    }

    @Test
    void create_generatesScheduleIdPattern() {
        MaintenanceSchedule s = new MaintenanceSchedule();
        when(idGenService.generateMtncSchId()).thenReturn("MS-" + Calendar.getInstance().get(Calendar.YEAR) + "-001");
        when(scheduleRepo.save(s)).thenReturn(s);

        MaintenanceSchedule created = scheduleService.create(s);
        assertNotNull(created.getScheduleId());
        assertTrue(created.getScheduleId().matches("MS-\\d{4}-\\d{3}")); // ตรวจ pattern
    }
}
