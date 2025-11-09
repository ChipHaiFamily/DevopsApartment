package com.example.apartmentmanagement.dto;

import com.example.apartmentmanagement.model.Invoice;
import com.example.apartmentmanagement.model.MaintenanceLog;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;
import java.util.List;

@Data
@Builder
public class DashboardDto {
    private int totalRooms;
    private int rentedRooms;
    private int outstandingInvoices;
    private int openMaintenance;
    private List<RoomDto> rooms;
    private double occupancyRate;
    private BigDecimal monthlyRevenue;
    private int paidRoomsCount;
    private Map<String, BigDecimal> electricityUsage;
    private Map<String, BigDecimal> waterUsage;
    private List<MaintenanceLog> maintenanceTasks;
    private List<Invoice> outstandingInvoicesList;
    private List<ScheduleDto> maintenanceSchedule;
    private List<SupplyDto> supplyItems;

    @Data
    @Builder
    public static class ScheduleDto {
        private String scheduleId;
        private String taskName;
        private String scheduledDate;
    }

    @Data
    @Builder
    public static class SupplyDto {
        private String itemId;
        private String name;
        private int quantity;
        private String status;
        private String note;
    }
}
