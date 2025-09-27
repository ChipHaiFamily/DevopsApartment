package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.ReportDashboardDto;
import com.example.apartmentmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportDashboardService {

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private final ContractRepository contractRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;

    public ReportDashboardDto getReportDashboard(String monthStr) {
        YearMonth month = YearMonth.parse(monthStr); // ex. "2025-06"
        LocalDate startDate = month.atDay(1);
        LocalDate endDate = month.atEndOfMonth();

        // --- Summary ---
        int totalRooms = roomRepository.countAllRooms();
        int occupiedRooms = contractRepository.countActiveContractsDuring(startDate, endDate);
        int occupancyRate = totalRooms == 0 ? 0 : (occupiedRooms * 100 / totalRooms);

        BigDecimal totalRevenue = Optional.ofNullable(
                paymentRepository.sumRevenueByDateBetween(startDate, endDate)
        ).orElse(BigDecimal.ZERO);

        BigDecimal maintenanceCost = Optional.ofNullable(
                maintenanceLogRepository.sumCostByDateBetween(startDate, endDate)
        ).orElse(BigDecimal.ZERO);

        BigDecimal netProfit = totalRevenue.subtract(maintenanceCost);

        log.info("Summary for {} → totalRooms={}, occupied={}, revenue={}, maintenance={}, netProfit={}",
                monthStr, totalRooms, occupiedRooms, totalRevenue, maintenanceCost, netProfit);

        ReportDashboardDto.SummaryDto summary = ReportDashboardDto.SummaryDto.builder()
                .occupancyRate(occupancyRate)
                .totalRevenue(totalRevenue)
                .maintenanceCost(maintenanceCost)
                .netProfit(netProfit)
                .build();

        // --- Monthly Revenue (last 12 months) ---
        List<ReportDashboardDto.MonthlyRevenueDto> monthlyRevenue = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            YearMonth ym = month.minusMonths(i);
            LocalDate mStart = ym.atDay(1);
            LocalDate mEnd = ym.atEndOfMonth();
            BigDecimal revenue = Optional.ofNullable(
                    paymentRepository.sumRevenueByDateBetween(mStart, mEnd)
            ).orElse(BigDecimal.ZERO);

            monthlyRevenue.add(ReportDashboardDto.MonthlyRevenueDto.builder()
                    .month(ym.toString())
                    .revenue(revenue)
                    .build());
        }

        // --- Monthly Occupancy (last 12 months) ---
        List<ReportDashboardDto.MonthlyOccupancyDto> monthlyOccupancy = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            YearMonth ym = month.minusMonths(i);
            LocalDate mStart = ym.atDay(1);
            LocalDate mEnd = ym.atEndOfMonth();

            int total = roomRepository.countAllRooms();
            int occupied = contractRepository.countActiveContractsDuring(mStart, mEnd);
            int rate = total == 0 ? 0 : (occupied * 100 / total);

            monthlyOccupancy.add(ReportDashboardDto.MonthlyOccupancyDto.builder()
                    .month(ym.toString())
                    .occupancyRate(rate)
                    .build());
        }

        // --- Room Efficiency ---
        List<ReportDashboardDto.RoomEfficiencyDto> roomEfficiency =
                roomRepository.findAllRoomTypeNames().stream().map(rt -> {
                    int total = roomRepository.countByTypeName(rt);
                    int occupied = contractRepository.countActiveContractsDuring(startDate, endDate);
                    int rate = total == 0 ? 0 : (occupied * 100 / total);
                    return ReportDashboardDto.RoomEfficiencyDto.builder()
                            .type(rt)
                            .total(total)
                            .occupied(occupied)
                            .rate(rate)
                            .build();
                }).collect(Collectors.toList());

        // --- Maintenance Works ---
        List<ReportDashboardDto.MaintenanceWorkDto> maintenanceWorks =
                maintenanceLogRepository.findMaintenanceSummaryByDateBetween(startDate, endDate)
                        .stream()
                        .map(obj -> {
                            String type = (String) obj[0];
                            int count = ((Number) obj[1]).intValue();
                            Number n = (Number) obj[2]; // แก้ตรงนี้
                            BigDecimal cost = n != null ? BigDecimal.valueOf(n.doubleValue()) : BigDecimal.ZERO;
                            return ReportDashboardDto.MaintenanceWorkDto.builder()
                                    .type(type)
                                    .count(count)
                                    .cost(cost)
                                    .build();
                        })
                        .toList();

        // --- Build DTO ---
        return ReportDashboardDto.builder()
                .month(monthStr)
                .summary(summary)
                .monthlyRevenue(monthlyRevenue)
                .monthlyOccupancy(monthlyOccupancy)
                .roomEfficiency(roomEfficiency)
                .maintenanceWorks(maintenanceWorks)
                .build();
    }
}
