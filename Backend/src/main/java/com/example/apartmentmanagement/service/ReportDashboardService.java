package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.MeterInvoiceDto;
import com.example.apartmentmanagement.dto.ReportDashboardDto;
import com.example.apartmentmanagement.dto.RoomDto;
import com.example.apartmentmanagement.model.*;
import com.example.apartmentmanagement.repository.*;
import com.example.apartmentmanagement.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportDashboardService {

    private final RoomRepository roomRepository;
    private final InvoiceRepository invoiceRepository;
    private final ContractRepository contractRepository;
    private final MaintenanceLogRepository maintenanceRepository;
    private final AuditLogService auditLogService;
    private final MeterService meterService;

    public ReportDashboardDto getReport(String month) {
        List<Room> rooms = roomRepository.findAll();
        List<AuditLog> logs = auditLogService.getByPeriod(month);

        Set<String> invoiceIds = extractIdsForTable(logs, "invoice");
        Set<String> contractIds = extractIdsForTable(logs, "contract");
        Set<String> maintenanceIds = extractIdsForTable(logs, "maintenance_log");

        List<Invoice> invoices = invoiceIds.isEmpty()
                ? Collections.emptyList()
                : invoiceRepository.findAllById(invoiceIds);

        List<Contract> contracts = contractIds.isEmpty()
                ? Collections.emptyList()
                : contractRepository.findAllById(contractIds);

        List<MaintenanceLog> maintenances = maintenanceIds.isEmpty()
                ? Collections.emptyList()
                : maintenanceRepository.findAllById(maintenanceIds);

        int totalRooms = rooms.size();
        long occupiedRooms = rooms.stream()
                .filter(r -> "Occupied".equalsIgnoreCase(r.getStatus()))
                .count();
        double occupancyRate = totalRooms == 0 ? 0 : (double) occupiedRooms / totalRooms * 100;

        double totalIncome = invoices.stream()
                .map(Invoice::getTotalAmount)
                .filter(Objects::nonNull)
                .mapToDouble(BigDecimal::doubleValue)
                .sum();

        double maintenanceCost = maintenances.stream()
                .mapToDouble(MaintenanceLog::getCost)
                .sum();

        List<ReportDashboardDto.RoomDetailDto> roomDetails = rooms.stream().map(room -> {

            String roomNum = room.getRoomNum();

            String tenantName = contracts.stream()
                    .filter(c -> c.getRoom().getRoomNum().equals(roomNum))
                    .map(c -> c.getTenant().getUser().getFullName())
                    .findFirst()
                    .orElse(null);

            MeterInvoiceDto meterData = meterService.getLatestMetersWithRoomPrice(roomNum);
            BigDecimal waterUsage = BigDecimal.ZERO;
            BigDecimal electricityUsage = BigDecimal.ZERO;

            if (meterData != null && meterData.getLatestMeters() != null) {
                for (MeterInvoiceDto.MeterDetail m : meterData.getLatestMeters()) {
                    if ("water".equalsIgnoreCase(m.getType())) {
                        waterUsage = BigDecimal.valueOf(m.getUnit());
                    } else if ("electricity".equalsIgnoreCase(m.getType())) {
                        electricityUsage = BigDecimal.valueOf(m.getUnit());
                    }
                }
            }

            // --- รวมค่าใช้จ่ายซ่อมของห้องนี้ทั้งหมด ---
            double roomMaintenanceCost = maintenances.stream()
                    .filter(m -> m.getRoom().getRoomNum().equals(roomNum))
                    .mapToDouble(MaintenanceLog::getCost)
                    .sum();

            return ReportDashboardDto.RoomDetailDto.builder()
                    .roomNum(roomNum)
                    .tenantName(tenantName)
                    .status(room.getStatus())
                    .waterUsage(waterUsage)
                    .electricityUsage(electricityUsage)
                    .maintenanceCost(roomMaintenanceCost)
                    .build();
        }).toList();

        return ReportDashboardDto.builder()
                .occupancyRate(occupancyRate)
                .totalIncome(totalIncome)
                .maintenanceCost(maintenanceCost)
                .profit(totalIncome - maintenanceCost)
                .roomDetails(roomDetails)
                .invoices(invoices)
                .contracts(contracts)
                .maintenances(maintenances)
                .build();
    }

    private Set<String> extractIdsForTable(List<AuditLog> logs, String tableName) {
        return logs.stream()
                .filter(l -> {
                    String name = l.getTableName().toLowerCase();
                    return name.equals(tableName.toLowerCase())
                            || name.equals(tableName.toLowerCase() + "s");
                })
                .map(AuditLog::getRecordId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

}
