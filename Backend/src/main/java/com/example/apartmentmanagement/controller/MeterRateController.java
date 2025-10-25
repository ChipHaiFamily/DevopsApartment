package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.MeterRate;
import com.example.apartmentmanagement.repository.MeterRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meter-rate")
@RequiredArgsConstructor
public class MeterRateController {

    private final MeterRateRepository repository;

    @GetMapping
    public ResponseEntity<List<MeterRate>> getAllRates() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{type}")
    public ResponseEntity<MeterRate> getRateByType(@PathVariable String type) {
        MeterRate rate = repository.findByType(type);
        if (rate == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(rate);
    }

    @PostMapping
    public ResponseEntity<MeterRate> createOrUpdateRate(@RequestBody MeterRate meterRate) {
        MeterRate existing = repository.findByType(meterRate.getType());

        if (existing != null) {
            existing.setRate(meterRate.getRate());
            existing.setTimestamp(meterRate.getTimestamp());
            return ResponseEntity.ok(repository.save(existing));
        }

        MeterRate saved = repository.save(meterRate);
        return ResponseEntity.ok(saved);
    }
}

