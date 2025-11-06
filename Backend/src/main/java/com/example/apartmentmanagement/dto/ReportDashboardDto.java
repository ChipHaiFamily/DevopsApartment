package com.example.apartmentmanagement.dto;

import com.example.apartmentmanagement.model.Contract;
import com.example.apartmentmanagement.model.Invoice;
import com.example.apartmentmanagement.model.MaintenanceLog;
import com.example.apartmentmanagement.model.Room;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ReportDashboardDto {
    private double occupancyRate;
    private double totalIncome;
    private double maintenanceCost;
    private double profit;

    private List<RoomDetailDto> roomDetails;
    private List<Invoice> invoices;
    private List<Contract> contracts;
    private List<MaintenanceLog> maintenances;

    @Data
    @Builder
    public static class RoomDetailDto {
        private String roomNum;
        private String tenantName;
        private String status;

        private BigDecimal waterUsage;
        private BigDecimal electricityUsage;
        private Double maintenanceCost;
    }
}
