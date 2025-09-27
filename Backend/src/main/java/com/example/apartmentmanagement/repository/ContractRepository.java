package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, String> {
    List<Contract> findByRoom_RoomNum(String roomNum);

    @Query("SELECT c FROM Contract c WHERE c.tenant.tenantId = :tenantId AND c.status = 'active'")
    List<Contract> findActiveContractsByTenant(@Param("tenantId") String tenantId);

    Optional<Contract> findByRoomRoomNumAndStatus(String roomNum, String status);

    Optional<Contract> findTopByOrderByContractNumDesc();

    // ดึง contract active ที่ครอบคลุมช่วงเดือน
    @Query("SELECT c FROM Contract c " +
            "WHERE c.status = :status " +
            "AND c.startDate <= :endDate " +
            "AND c.endDate >= :startDate")
    List<Contract> findByStatusAndDateRange(@Param("status") String status,
                                            @Param("startDate") LocalDate startDate,
                                            @Param("endDate") LocalDate endDate);

    // นับจำนวน contract active ในช่วงเดือน
    @Query("SELECT COUNT(c) FROM Contract c " +
            "WHERE c.status = 'active' " +
            "AND c.startDate <= :endDate " +
            "AND c.endDate >= :startDate")
    int countActiveContractsDuring(@Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate);

    // นับจำนวน contract active แยกตาม room type
    @Query("SELECT COUNT(c) FROM Contract c " +
            "WHERE c.status = 'active' " +
            "AND c.startDate <= :endDate " +
            "AND c.endDate >= :startDate " +
            "AND c.room.roomType.name = :typeName")
    int countActiveContractsByRoomType(@Param("typeName") String typeName,
                                       @Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);
}
