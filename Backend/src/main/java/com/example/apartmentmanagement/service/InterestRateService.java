package com.example.apartmentmanagement.service;
import com.example.apartmentmanagement.model.InterestRate;
import com.example.apartmentmanagement.repository.InterestRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InterestRateService {

    private final InterestRateRepository repository;

    public InterestRate saveRate(InterestRate InterestRate) {
        InterestRate.setTimestamp(LocalDateTime.now());
        return repository.save(InterestRate);
    }
}

