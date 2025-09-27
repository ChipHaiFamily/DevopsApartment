package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.MaintenanceLog;
import com.example.apartmentmanagement.service.MaintenanceLogService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/maintenance-logs")
public class MaintenanceLogController {
    private final MaintenanceLogService service;
    public MaintenanceLogController(MaintenanceLogService service) { this.service = service; }
    @GetMapping public List<MaintenanceLog> getAll() { return service.findAll(); }
    @GetMapping("/{id}") public Optional<MaintenanceLog> getById(@PathVariable String id) { return service.findById(id); }
    @PostMapping public MaintenanceLog create(@RequestBody MaintenanceLog obj) { return service.create(obj); }
    @PutMapping("/{id}") public MaintenanceLog update(@PathVariable String id, @RequestBody MaintenanceLog obj) { obj.setLogId(id); return service.save(obj); }
    @DeleteMapping("/{id}") public void delete(@PathVariable String id) { service.deleteById(id); }
}
