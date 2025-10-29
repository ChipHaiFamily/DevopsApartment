package com.example.apartmentmanagement.service;
import com.example.apartmentmanagement.model.MeterRate;
import com.example.apartmentmanagement.repository.MeterRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class MeterRateService {

    private final MeterRateRepository repository;

    public MeterRate saveRate(MeterRate meterRate) {
        meterRate.setTimestamp(OffsetDateTime.now(ZoneId.of("Asia/Bangkok")));
        return repository.save(meterRate);
    }
}

