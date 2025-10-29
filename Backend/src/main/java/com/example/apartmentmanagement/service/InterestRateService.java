package com.example.apartmentmanagement.service;
import com.example.apartmentmanagement.model.InterestRate;
import com.example.apartmentmanagement.repository.InterestRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class InterestRateService {

    private final InterestRateRepository repository;

    public InterestRate saveRate(InterestRate InterestRate) {
        InterestRate.setTimestamp(OffsetDateTime.now(ZoneId.of("Asia/Bangkok")));
        return repository.save(InterestRate);
    }
}

