package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.MeterRate;
import com.example.apartmentmanagement.repository.MeterRateRepository;
import com.example.apartmentmanagement.service.MeterRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meter-rate")
@RequiredArgsConstructor
public class MeterRateController {

    private final MeterRateRepository repository;
    private final MeterRateService service;

    @GetMapping
    public ResponseEntity<List<MeterRate>> getAllRates() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/history/{type}")
    public ResponseEntity<List<MeterRate>> getHistory(@PathVariable String type) {
        return ResponseEntity.ok(repository.findByTypeOrderByTimestampDesc(type));
    }

    @GetMapping("/{type}")
    public ResponseEntity<MeterRate> getRateByType(@PathVariable String type) {
        MeterRate rate = repository.findByType(type);
        if (rate == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(rate);
    }

    @GetMapping("/latest/{type}")
    public ResponseEntity<MeterRate> getLatestRate(@PathVariable String type) {
        MeterRate rate = repository.findTopByTypeOrderByTimestampDesc(type);
        if (rate == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(rate);
    }

    @PostMapping
    public ResponseEntity<MeterRate> createRate(@RequestBody MeterRate meterRate) {
        MeterRate saved = service.saveRate(meterRate);
        return ResponseEntity.ok(saved);
    }
}


