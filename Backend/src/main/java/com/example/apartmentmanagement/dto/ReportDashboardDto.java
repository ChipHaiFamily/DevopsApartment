package com.example.apartmentmanagement.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDashboardDto {

    private String month; // เดือนที่เลือก

    // สรุปยอดรวม
    private SummaryDto summary;

    // รายเดือน
    private List<MonthlyRevenueDto> monthlyRevenue;
    private List<MonthlyOccupancyDto> monthlyOccupancy;

    // ประสิทธิภาพห้องพัก
    private List<RoomEfficiencyDto> roomEfficiency;

    // งานซ่อมบำรุง
    private List<MaintenanceWorkDto> maintenanceWorks;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummaryDto {
        private int occupancyRate; // %
        private BigDecimal totalRevenue;
        private BigDecimal maintenanceCost;
        private BigDecimal netProfit;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyRevenueDto {
        private String month; // YYYY-MM
        private BigDecimal revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyOccupancyDto {
        private String month; // YYYY-MM
        private int occupancyRate; // %
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoomEfficiencyDto {
        private String type; // ประเภทห้อง
        private int total;   // จำนวนห้องทั้งหมด
        private int occupied; // จำนวนเข้าพัก
        private int rate;     // %
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MaintenanceWorkDto {
        private String type; // ประเภทงาน เช่น แอร์
        private int count;   // จำนวนงาน
        private BigDecimal cost; // ค่าใช้จ่าย
    }
}
