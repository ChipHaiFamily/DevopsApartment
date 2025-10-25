package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoomTypeRepository extends JpaRepository<RoomType, String> {
    Optional<RoomType> findTopByOrderByRoomTypeIdDesc();
}
