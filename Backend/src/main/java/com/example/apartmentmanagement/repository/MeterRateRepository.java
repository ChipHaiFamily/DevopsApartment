package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.MeterRate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeterRateRepository extends JpaRepository<MeterRate, Long> {
    MeterRate findByType(String type);

    List<MeterRate> findByTypeOrderByTimestampDesc(String type);

    MeterRate findTopByTypeOrderByTimestampDesc(String type);

}

