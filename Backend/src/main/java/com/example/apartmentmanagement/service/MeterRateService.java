package com.example.apartmentmanagement.service;
import com.example.apartmentmanagement.model.MeterRate;
import com.example.apartmentmanagement.repository.MeterRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MeterRateService {

    private final MeterRateRepository repository;

    public MeterRate saveRate(MeterRate meterRate) {
        meterRate.setTimestamp(LocalDateTime.now());
        return repository.save(meterRate);
    }
}

