package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.Meter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MeterRepository extends JpaRepository<Meter, String> {
    List<Meter> findByRoomAndRecordDateBetween(String room, LocalDate startDate, LocalDate endDate);
    Meter findTopByPeriodAndRoomOrderByMeterIdDesc(String period, String room);
}
