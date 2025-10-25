package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.SuppliesHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SuppliesHistoryRepository extends JpaRepository<SuppliesHistory, String> {

    Optional<SuppliesHistory> findTopByOrderByHistoryIdDesc();

}
