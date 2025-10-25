package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.MeterRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MeterRateRepository extends JpaRepository<MeterRate, Long> {
    @Query(value = """
    SELECT DISTINCT ON (type) *
    FROM meter_rate
    ORDER BY type, timestamp DESC
    """, nativeQuery = true)
    List<MeterRate> findLatestRatesForAllTypes();

    List<MeterRate> findByTypeOrderByTimestampDesc(String type);

    MeterRate findTopByTypeOrderByTimestampDesc(String type);

}

