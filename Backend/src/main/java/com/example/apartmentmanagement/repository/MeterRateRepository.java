package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.MeterRate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeterRateRepository extends JpaRepository<MeterRate, Long> {
    MeterRate findByType(String type);
}

