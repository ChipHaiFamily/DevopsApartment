package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.MaintenanceLog;
import com.example.apartmentmanagement.model.MaintenanceSchedule;
import com.example.apartmentmanagement.repository.MaintenanceLogRepository;
import com.example.apartmentmanagement.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MaintenanceLogService {
    private final MaintenanceLogRepository repository;
    private final IdGenerationService idGenerationService;

    public List<MaintenanceLog> findAll() { return repository.findAll(); }
    public Optional<MaintenanceLog> findById(String id) { return repository.findById(id); }
    public MaintenanceLog save(MaintenanceLog obj) { return repository.save(obj); }
    public void deleteById(String id) { repository.deleteById(id); }

    public int countOpenTasks() {
        return (int) repository.findAll().stream()
                .filter(m -> !"COMPLETED".equalsIgnoreCase(m.getStatus()))
                .count();
    }

    public MaintenanceLog create(MaintenanceLog obj) {
        obj.setLogId(idGenerationService.generateMtncLogId());
        return repository.save(obj);
    }

    public List<MaintenanceLog> getOpenTasks() {
        return repository.findAll().stream()
                .filter(m -> !"COMPLETED".equalsIgnoreCase(m.getStatus()))
                .toList();
    }
}
