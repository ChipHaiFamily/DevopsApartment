package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.DashboardDto;
import com.example.apartmentmanagement.model.MaintenanceSchedule;
import com.example.apartmentmanagement.repository.MaintenanceScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceScheduleService {
    private final MaintenanceScheduleRepository repository;
    private final IdGenerationService  idGenerationService;

    public List<MaintenanceSchedule> findAll() { return repository.findAll(); }
    public Optional<MaintenanceSchedule> findById(String id) { return repository.findById(id); }
    public MaintenanceSchedule save(MaintenanceSchedule obj) { return repository.save(obj); }

    public MaintenanceSchedule create(MaintenanceSchedule obj) {
        obj.setScheduleId(idGenerationService.generateMtncSchId());
        return repository.save(obj);
    }

    public List<DashboardDto.ScheduleDto> getUpcomingSchedule() {
        LocalDate now = LocalDate.now();
        LocalDate next30Days = now.plusDays(30);

        return repository.findAll().stream()
                .filter(s -> s.getNextDue() != null &&
                        !s.getNextDue().isBefore(now) &&
                        !s.getNextDue().isAfter(next30Days))
                .sorted((a, b) -> a.getNextDue().compareTo(b.getNextDue()))
                .limit(10)
                .map(s -> DashboardDto.ScheduleDto.builder()
                        .scheduleId(String.valueOf(s.getScheduleId()))
                        .taskName(s.getTaskName())
                        .scheduledDate(s.getNextDue().toString())
                        .build())
                .collect(Collectors.toList());
    }

    public void deleteById(String id) { repository.deleteById(id); }
}
