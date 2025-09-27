package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, String> {
    List<Room> findByStatus(String status);
    List<Room> findByFloor(int floor);

    @Query("SELECT COUNT(r) FROM Room r")
    int countAllRooms();

    @Query("SELECT COUNT(r) FROM Room r WHERE r.roomType.name = :typeName")
    int countByTypeName(@Param("typeName") String typeName);

    @Query("SELECT DISTINCT r.roomType.name FROM Room r")
    List<String> findAllRoomTypeNames();
}