package com.example.apartmentmanagement.repository;

import aj.org.objectweb.asm.commons.Remapper;
import com.example.apartmentmanagement.model.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, String> {
    Optional<MaintenanceLog> findTopByOrderByLogIdDesc();

    Long countByRoomRoomNumAndStatus(String roomNum, String status);

    List<MaintenanceLog> findByRoomRoomNumOrderByRequestDateDesc(String roomNum);

    @Query("SELECT COALESCE(SUM(m.cost), 0) FROM MaintenanceLog m WHERE m.requestDate BETWEEN :start AND :end")
    BigDecimal sumCostByDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT m.logType as type, COUNT(m) as count, COALESCE(SUM(m.cost), 0) as cost " +
            "FROM MaintenanceLog m " +
            "WHERE m.requestDate BETWEEN :start AND :end " +
            "GROUP BY m.logType")
    List<Object[]> findMaintenanceSummaryByDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

}
