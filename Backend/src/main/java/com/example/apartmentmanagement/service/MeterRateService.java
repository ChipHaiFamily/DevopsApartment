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

    public void initRates() {
        if (repository.count() == 0) {
            MeterRate water = new MeterRate();
            water.setType("water");
            water.setRate(4.0);
            water.setTimestamp(LocalDateTime.now());

            MeterRate electric = new MeterRate();
            electric.setType("electricity");
            electric.setRate(7.0);
            electric.setTimestamp(LocalDateTime.now());

            repository.save(water);
            repository.save(electric);
        }
    }
}

