package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.Supplies;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SuppliesRepository extends JpaRepository<Supplies, String> {
    Optional<Supplies> findTopByOrderByItemIdDesc();
}