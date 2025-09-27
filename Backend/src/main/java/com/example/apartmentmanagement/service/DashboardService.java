package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.*;
import com.example.apartmentmanagement.exception.ResourceNotFoundException;
import com.example.apartmentmanagement.model.*;
import com.example.apartmentmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.Comparator;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class DashboardService {

    private final RoomRepository roomRepo;
    private final ContractRepository contractRepo;
    private final InvoiceRepository invoiceRepo;
    private final MaintenanceLogRepository maintenanceRepo;
    private final TenantRepository tenantRepo;

    public RoomDashboardDto getRoomDashboard(String roomNum) {
        Room room = roomRepo.findById(roomNum)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        Contract contract = contractRepo.findByRoomRoomNumAndStatus(roomNum, "active")
                .orElseThrow(() -> new ResourceNotFoundException("No active contract"));

        String tenantName = contract.getTenant().getTenantId();

        long daysStayed = ChronoUnit.DAYS.between(contract.getStartDate(), LocalDate.now());

        BigDecimal totalUnpaid = invoiceRepo.findTotalUnpaidByTenant(contract.getTenant().getTenantId());
        if (totalUnpaid == null) totalUnpaid = BigDecimal.ZERO;

        Double totalExpensesDouble = invoiceRepo.findTotalExpensesByTenant(tenantName);
        BigDecimal totalExpenses = totalExpensesDouble != null ? BigDecimal.valueOf(totalExpensesDouble) : BigDecimal.ZERO;

        long maintenanceCount = maintenanceRepo.countByRoomRoomNumAndStatus(roomNum, "pending");

        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        List<Invoice> invoices = invoiceRepo.findRecentInvoicesByTenant(tenantName, sixMonthsAgo);

        Map<String, ConsumptionDto> monthMap = new LinkedHashMap<>();

        invoices.forEach(invoice -> {
            String ym = invoice.getIssueDate().getYear() + "-" +
                    String.format("%02d", invoice.getIssueDate().getMonthValue());

            monthMap.putIfAbsent(ym, ConsumptionDto.builder()
                    .month(ym)
                    .water(BigDecimal.ZERO)
                    .electric(BigDecimal.ZERO)
                    .total(BigDecimal.ZERO)
                    .build());

            for (InvoiceItem item : invoice.getItems()) {
                BigDecimal amount = item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO;

                if (item.getDescription().toLowerCase().contains("water") ||
                        item.getDescription().contains("น้ำ")) {
                    monthMap.get(ym).setWater(monthMap.get(ym).getWater().add(amount));
                } else if (item.getDescription().toLowerCase().contains("electricity") ||
                        item.getDescription().contains("ไฟ")) {
                    monthMap.get(ym).setElectric(monthMap.get(ym).getElectric().add(amount));
                }
                monthMap.get(ym).setTotal(monthMap.get(ym).getTotal().add(amount));
            }
        });

        List<ConsumptionDto> last6Months = new ArrayList<>(monthMap.values());

        return RoomDashboardDto.builder()
                .roomNum(room.getRoomNum())
                .status(room.getStatus())
                .tenantName(tenantName)
                .daysStayed(daysStayed)
                .totalUnpaid(totalUnpaid)
                .maintenanceCount(maintenanceCount)
                .totalExpenses(totalExpenses)
                .last6Months(last6Months)
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
        Room room = roomRepo.findById(roomNum)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        return maintenanceRepo.findByRoomRoomNumOrderByRequestDateDesc(roomNum);
    }

    public TenantsManagement getTenantDetail(String tenantId) {
        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantId));

        // map contracts
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

}
