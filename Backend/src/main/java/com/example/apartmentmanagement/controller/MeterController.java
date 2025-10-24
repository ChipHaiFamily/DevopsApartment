package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.Meter;
import com.example.apartmentmanagement.repository.MeterRepository;
import com.example.apartmentmanagement.service.MeterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/meters")
@RequiredArgsConstructor
public class MeterController {

    private final MeterService service;
    private final MeterRepository repository;

    @GetMapping
    public List<Meter> getAll() {
        return service.getAllMeters();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Meter> getById(@PathVariable String id) {
        Optional<Meter> meter = repository.findById(id);
        return meter.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Meter> create(@RequestBody Meter obj) {
        if (obj.getRecordDate() == null) {
            return ResponseEntity.badRequest().build();
        }
        Meter meter = service.addMeter(
                obj.getRoom(),
                obj.getType(),
                obj.getUnit(),
                obj.getRecordDate()
        );
        return ResponseEntity.ok(meter);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Meter> update(@PathVariable String id, @RequestBody Meter obj) {
        Optional<Meter> existing = repository.findById(id);
        if (existing.isPresent()) {
            Meter meter = existing.get();
            meter.setRoom(obj.getRoom());
            meter.setType(obj.getType());
            meter.setUnit(obj.getUnit());
            meter.setPeriod(obj.getPeriod());
            meter.setRecordDate(obj.getRecordDate());
            return ResponseEntity.ok(repository.save(meter));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
