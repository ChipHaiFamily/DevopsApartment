package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, String> {
    Optional<Reservation> findTopByOrderByReservationNumDesc();

    @Query("SELECT COUNT(res) FROM Reservation res WHERE res.dateTime BETWEEN :start AND :end")
    int countByDateBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(res) FROM Reservation res WHERE res.roomType.name = :typeName AND res.dateTime BETWEEN :start AND :end")
    int countOccupiedByTypeNameAndDateBetween(@Param("typeName") String typeName,
                                              @Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);
}
