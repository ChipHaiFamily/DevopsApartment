package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.SuppliesHistory;
import com.example.apartmentmanagement.service.SuppliesHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplies-history")
@RequiredArgsConstructor
public class SuppliesHistoryController {

    private final SuppliesHistoryService service;

    @GetMapping
    public ResponseEntity<List<SuppliesHistory>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuppliesHistory> getById(@PathVariable String id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SuppliesHistory> create(@RequestBody SuppliesHistory obj) {
        return ResponseEntity.ok(service.save(obj));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
