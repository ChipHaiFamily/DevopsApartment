package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.MaintenanceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceSchedule, String> {
    Optional<MaintenanceSchedule> findTopByOrderByScheduleIdDesc();
}
