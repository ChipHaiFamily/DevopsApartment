package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.MaintenanceSchedule;
import com.example.apartmentmanagement.service.MaintenanceScheduleService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/maintenance-schedules")
public class MaintenanceScheduleController {
    private final MaintenanceScheduleService service;
    public MaintenanceScheduleController(MaintenanceScheduleService service) { this.service = service; }
    @GetMapping public List<MaintenanceSchedule> getAll() { return service.findAll(); }
    @GetMapping("/{id}") public Optional<MaintenanceSchedule> getById(@PathVariable String id) { return service.findById(id); }
    @PostMapping public MaintenanceSchedule create(@RequestBody MaintenanceSchedule obj) { return service.create(obj); }
    @PutMapping("/{id}") public MaintenanceSchedule update(@PathVariable String id, @RequestBody MaintenanceSchedule obj) { obj.setScheduleId(id); return service.save(obj); }
    @DeleteMapping("/{id}") public void delete(@PathVariable String id) { service.deleteById(id); }
}
