package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.InterestRate;
import com.example.apartmentmanagement.repository.InterestRateRepository;
import com.example.apartmentmanagement.service.InterestRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interest-rate")
@RequiredArgsConstructor
public class InterestRateController {

    private final InterestRateRepository repository;
    private final InterestRateService service;

    @GetMapping
    public ResponseEntity<List<InterestRate>> getAllRates() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/history/{type}")
    public ResponseEntity<List<InterestRate>> getHistory(@PathVariable String type) {
        return ResponseEntity.ok(repository.findByTypeOrderByTimestampDesc(type));
    }

    @GetMapping("/latest")
    public ResponseEntity<List<InterestRate>> getLatestForAllTypes() {
        List<InterestRate> result = repository.findLatestRatesForAllTypes();
        if (result.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/latest/{type}")
    public ResponseEntity<InterestRate> getLatestRate(@PathVariable String type) {
        InterestRate rate = repository.findTopByTypeOrderByTimestampDesc(type);
        if (rate == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(rate);
    }

    @PostMapping
    public ResponseEntity<InterestRate> createRate(@RequestBody InterestRate InterestRate) {
        InterestRate saved = service.saveRate(InterestRate);
        return ResponseEntity.ok(saved);
    }
}


