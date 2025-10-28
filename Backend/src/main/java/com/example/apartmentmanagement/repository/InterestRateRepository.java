package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.InterestRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InterestRateRepository extends JpaRepository<InterestRate, Long> {
    @Query(value = """
    SELECT DISTINCT ON (type) *
    FROM interest_rate
    ORDER BY type, timestamp DESC
    """, nativeQuery = true)
    List<InterestRate> findLatestRatesForAllTypes();

    List<InterestRate> findByTypeOrderByTimestampDesc(String type);

    InterestRate findTopByTypeOrderByTimestampDesc(String type);

}

