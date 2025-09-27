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
    private String tenantName;
    private long daysStayed;
    private BigDecimal totalUnpaid;
    private long maintenanceCount;
    private BigDecimal totalExpenses;
    private List<ConsumptionDto> last6Months; // ✅ เพิ่ม field นี้
}
