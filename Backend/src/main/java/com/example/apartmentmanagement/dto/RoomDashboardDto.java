package com.example.apartmentmanagement.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomDashboardDto {
    private String roomNum;
    private String status;
    private String tenantID;
    private long daysStayed;
    private BigDecimal totalUnpaid;
    private long maintenanceCount;
    private List<ConsumptionDto> consumption;
}
