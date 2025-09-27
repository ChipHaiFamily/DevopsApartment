package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.MaintenanceSchedule;
import com.example.apartmentmanagement.repository.MaintenanceScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

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

    public void deleteById(String id) { repository.deleteById(id); }
}
