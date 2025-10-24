package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.Meter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeterRepository extends JpaRepository<Meter, String> {
    List<Meter> findByRoomAndPeriod(String room, String period);
    Meter findTopByPeriodAndRoomOrderByMeterIdDesc(String period, String room);
}
