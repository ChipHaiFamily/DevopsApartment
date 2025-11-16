package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.DashboardDto;
import com.example.apartmentmanagement.model.MaintenanceSchedule;
import com.example.apartmentmanagement.repository.MaintenanceScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;
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

    @Test
    void getUpcomingSchedule_returnsFilteredSortedLimitedSchedules() {
        MaintenanceSchedule s1 = new MaintenanceSchedule();
        s1.setScheduleId("S1");
        s1.setTaskName("Task 1");
        s1.setNextDue(LocalDate.now().plusDays(5));

        MaintenanceSchedule s2 = new MaintenanceSchedule();
        s2.setScheduleId("S2");
        s2.setTaskName("Task 2");
        s2.setNextDue(LocalDate.now().plusDays(15));

        MaintenanceSchedule s3 = new MaintenanceSchedule();
        s3.setScheduleId("S3");
        s3.setTaskName("Task 3");
        s3.setNextDue(LocalDate.now().plusDays(40)); // เกิน 30 วัน -> should be filtered out

        when(scheduleRepo.findAll()).thenReturn(List.of(s2, s3, s1));

        List<DashboardDto.ScheduleDto> result = scheduleService.getUpcomingSchedule();

        assertEquals(2, result.size());
        assertEquals("Task 1", result.get(0).getTaskName());
        assertEquals("Task 2", result.get(1).getTaskName());
        assertEquals("S1", result.get(0).getScheduleId());
    }

}
