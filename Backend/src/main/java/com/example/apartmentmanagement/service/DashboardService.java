package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.*;
import com.example.apartmentmanagement.exception.ResourceNotFoundException;
import com.example.apartmentmanagement.model.*;
import com.example.apartmentmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final RoomRepository roomRepo;
    private final ContractRepository contractRepo;
    private final InvoiceRepository invoiceRepo;
    private final MeterRepository meterRepo;
    private final MaintenanceLogRepository maintenanceRepo;
    private final TenantRepository tenantRepo;
    private final SuppliesRepository suppliesRepo;

    public RoomDashboardDto getRoomDashboard(String roomNum, String startMonth, String endMonth) {
        Room room = roomRepo.findById(roomNum)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        Contract contract = contractRepo.findByRoomRoomNumAndStatus(roomNum, "active")
                .orElseThrow(() -> new ResourceNotFoundException("No active contract"));

        String tenantID = contract.getTenant().getTenantId();
        long daysStayed = ChronoUnit.DAYS.between(contract.getStartDate(), LocalDate.now());

        BigDecimal totalUnpaid = invoiceRepo.findTotalUnpaidByTenant(tenantID);
        if (totalUnpaid == null) totalUnpaid = BigDecimal.ZERO;

        long inProgressCount = maintenanceRepo.countByRoomRoomNumAndStatus(roomNum, "in_progress");
        long scheduleCount   = maintenanceRepo.countByRoomRoomNumAndStatus(roomNum, "schedule");

        long maintenanceCount = inProgressCount + scheduleCount;

        LocalDate startDate = LocalDate.parse(startMonth + "-01");
        LocalDate endDate = YearMonth.parse(endMonth).atEndOfMonth();

        List<Meter> meters = meterRepo.findByRoomAndRecordDateBetween(roomNum, startDate, endDate);

        Map<String, ConsumptionDto> monthMap = new LinkedHashMap<>();

        meters.forEach(meter -> {
            String ym = meter.getPeriod() != null
                    ? meter.getPeriod()
                    : meter.getRecordDate().getYear() + "-" + String.format("%02d", meter.getRecordDate().getMonthValue());

            monthMap.putIfAbsent(ym, ConsumptionDto.builder()
                    .month(ym)
                    .water(BigDecimal.ZERO)
                    .electric(BigDecimal.ZERO)
                    .total(BigDecimal.ZERO)
                    .build());

            BigDecimal unitValue = BigDecimal.valueOf(meter.getUnit());

            if (meter.getType().equalsIgnoreCase("water")) {
                monthMap.get(ym).setWater(monthMap.get(ym).getWater().add(unitValue));
            } else if (meter.getType().equalsIgnoreCase("electricity")) {
                monthMap.get(ym).setElectric(monthMap.get(ym).getElectric().add(unitValue));
            }

            monthMap.get(ym).setTotal(monthMap.get(ym).getTotal().add(unitValue));
        });

        List<ConsumptionDto> monthlyConsumption = new ArrayList<>(monthMap.values());

        return RoomDashboardDto.builder()
                .roomNum(room.getRoomNum())
                .status(room.getStatus())
                .tenantID(tenantID)
                .daysStayed(daysStayed)
                .totalUnpaid(totalUnpaid)
                .maintenanceCount(maintenanceCount)
                .consumption(monthlyConsumption)
                .build();
    }

    public RoomOutstandingDto getOutstandingByRoomNum(String roomNum) {
        Contract contract = contractRepo.findByRoomRoomNumAndStatus(roomNum, "active")
                .orElseThrow(() -> new ResourceNotFoundException("No active contract for room " + roomNum));

        String tenantId = contract.getTenant().getTenantId();

        List<Invoice> invoices = invoiceRepo.findByTenantTenantId(tenantId);

        List<PaymentStatusDto> payments = invoices.stream().map(i -> {
            LocalDate lastPaidDate = i.getPayments() == null || i.getPayments().isEmpty()
                    ? null
                    : i.getPayments().stream()
                    .map(Payment::getPaymentDate)
                    .max(Comparator.naturalOrder())
                    .orElse(null);

            return PaymentStatusDto.builder()
                    .invoiceNo(i.getInvoiceId())
                    .amount(i.getTotalAmount())
                    .dueDate(i.getDueDate())
                    .paidDate(lastPaidDate)
                    .status(i.getStatus().equalsIgnoreCase("unpaid") ? "ค้างชำระ" : "ชำระแล้ว")
                    .build();
        }).toList();

        BigDecimal totalOutstanding = invoiceRepo.findTotalUnpaidByTenant(tenantId);
        if (totalOutstanding == null) totalOutstanding = BigDecimal.ZERO;

        return RoomOutstandingDto.builder()
                .roomNum(roomNum)
                .totalOutstanding(totalOutstanding)
                .payments(payments)
                .build();
    }

    public List<MaintenanceLog> getMaintenanceLogsByRoom(String roomNum) {
        roomRepo.findById(roomNum)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        return maintenanceRepo.findByRoomRoomNumOrderByRequestDateDesc(roomNum);
    }

    public TenantsManagement getTenantDetail(String tenantId) {
        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantId));

        List<TenantsManagement.ContractDto> contracts = tenant.getContract().stream()
                .map(c -> TenantsManagement.ContractDto.builder()
                        .contractNum(c.getContractNum())
                        .startDate(c.getStartDate())
                        .endDate(c.getEndDate())
                        .roomNumber(c.getRoom() != null ? c.getRoom().getRoomNum() : null)
                        .rentAmount(c.getRentAmount())
                        .deposit(c.getDeposit())
                        .billingCycle(c.getBillingCycle())
                        .status(c.getStatus())
                        .build())
                .collect(Collectors.toList());

        Contract latest = tenant.getContract().stream()
                .max(Comparator.comparing(Contract::getEndDate))
                .orElse(null);

        String currentStatus = (latest != null) ? latest.getStatus() : "unknown";

        String fullName = tenant.getUser().getFullName();

        return TenantsManagement.builder()
                .tenantId(tenant.getTenantId())
                .name(fullName)
                .gender(tenant.getUser().getSex())
                .email(tenant.getUser().getEmail())
                .phone(tenant.getUser().getTel())
                .sex(tenant.getUser().getSex())
                .job(tenant.getUser().getJob())
                .workplace(tenant.getUser().getWorkplace())
                .emergencyContact(tenant.getEmergencyContact())
                .emergencyName(tenant.getEmergencyName())
                .emergencyRelationship(tenant.getEmergencyRelationship())
                .currentStatus(currentStatus)
                .contracts(contracts)
                .build();
    }

    public List<TenantsManagement> getAllTenants() {
        return tenantRepo.findAll().stream()
                .map(t -> getTenantDetail(t.getTenantId()))
                .collect(Collectors.toList());
    }

    public Map<String, BigDecimal> getWaterUsageByMonth() {
        return meterRepo.findAll().stream()
                .filter(m -> "water".equalsIgnoreCase(m.getType()))
                .collect(Collectors.groupingBy(
                        m -> m.getRecordDate().getYear() + "-" +
                                String.format("%02d", m.getRecordDate().getMonthValue()),
                        TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO,
                                m -> BigDecimal.valueOf(m.getUnit()),
                                BigDecimal::add)
                ));
    }

    public Map<String, BigDecimal> getElectricityUsageByMonth() {
        return meterRepo.findAll().stream()
                .filter(m -> "electricity".equalsIgnoreCase(m.getType()))
                .collect(Collectors.groupingBy(
                        m -> m.getRecordDate().getYear() + "-" +
                                String.format("%02d", m.getRecordDate().getMonthValue()),
                        TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO,
                                m -> BigDecimal.valueOf(m.getUnit()),
                                BigDecimal::add)
                ));
    }

    public List<DashboardDto.SupplyDto> getAllSupplies() {
        return suppliesRepo.findAll().stream()
                .map(s -> DashboardDto.SupplyDto.builder()
                        .itemId(s.getItemId())
                        .name(s.getItem_Name())
                        .quantity(s.getQuantity() != null ? s.getQuantity() : 0)
                        .status(s.getStatus())
                        .build())
                .collect(Collectors.toList());
    }
}