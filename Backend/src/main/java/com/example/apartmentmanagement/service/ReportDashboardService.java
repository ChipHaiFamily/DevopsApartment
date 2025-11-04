package com.example.apartmentmanagement.service;

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

        return ReportDashboardDto.builder()
                .occupancyRate(occupancyRate)
                .totalIncome(totalIncome)
                .maintenanceCost(maintenanceCost)
                .profit(totalIncome - maintenanceCost)
                .rooms(rooms)
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
