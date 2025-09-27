package com.example.apartmentmanagement.dto;

import com.example.apartmentmanagement.model.Invoice;
import com.example.apartmentmanagement.model.MaintenanceLog;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
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
    private List<MaintenanceLog> maintenanceTasks;
    private List<Invoice> outstandingInvoicesList;
}

