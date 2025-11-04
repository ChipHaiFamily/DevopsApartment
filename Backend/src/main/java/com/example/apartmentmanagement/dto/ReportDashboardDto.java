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

    private List<Room> rooms;
    private List<Invoice> invoices;
    private List<Contract> contracts;
    private List<MaintenanceLog> maintenances;

}
