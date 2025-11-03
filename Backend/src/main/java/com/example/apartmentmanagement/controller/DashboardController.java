package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.dto.*;
import com.example.apartmentmanagement.model.Invoice;
import com.example.apartmentmanagement.model.MaintenanceLog;
import com.example.apartmentmanagement.model.Room;
import com.example.apartmentmanagement.model.RoomType;
import com.example.apartmentmanagement.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final ReportDashboardService reportDashboardService;
    private final RoomService roomService;
    private final InvoiceService invoiceService;
    private final PaymentService paymentService;
    private final MaintenanceLogService maintenanceService;
    private final TenantService tenantService;
    private final RoomTypeService roomTypeService;


    @GetMapping("/home")
    public ResponseEntity<HomeDashboardDto> getHomeDashboard() {
        int countRooms = roomService.countRooms();
        int countRentedRooms = roomService.countRentedRooms();
        int countTenants = tenantService.countTenants();

        List<RoomType> roomTypes = roomTypeService.findAll(); // ส่งตรง ๆ

        HomeDashboardDto dto = HomeDashboardDto.builder()
                .countRooms(countRooms)
                .countRentedRooms(countRentedRooms)
                .countTenants(countTenants)
                .roomTypes(roomTypes)
                .build();

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/room/{roomNum}")
    public ResponseEntity<ApiResponse<RoomDashboardDto>> getRoomDashboard(
            @PathVariable String roomNum,
            @RequestParam String startMonth,
            @RequestParam String endMonth) {

        RoomDashboardDto dto = dashboardService.getRoomDashboard(roomNum, startMonth, endMonth);
        return ResponseEntity.ok(new ApiResponse<>(true, "success", dto));
    }

    @GetMapping("/rooms/{roomNum}/payment")
    public ResponseEntity<RoomOutstandingDto> getOutstanding(@PathVariable String roomNum) {
        RoomOutstandingDto dto = dashboardService.getOutstandingByRoomNum(roomNum);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/rooms/{roomNum}/maintenance")
    public ResponseEntity<List<MaintenanceLog>> getMaintenanceLogs(@PathVariable String roomNum) {
        List<MaintenanceLog> logs = dashboardService.getMaintenanceLogsByRoom(roomNum);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/admin")
    public ResponseEntity<DashboardDto> getDashboardAdmin() {
        int totalRooms = roomService.countRooms();
        int rentedRooms = roomService.countRentedRooms();
        int outstandingInvoices = invoiceService.countOutstandingInvoices();
        int openMaintenance = maintenanceService.countOpenTasks();

        List<RoomDto> rooms = roomService.getRoomStatuses();
        double occupancyRate = rentedRooms * 100.0 / totalRooms;
        BigDecimal revenue = invoiceService.getRevenueThisMonth();
        List<MaintenanceLog> maintenanceTasks = maintenanceService.getOpenTasks();
        List<Invoice> outstandingList = invoiceService.getOutstandingInvoices();

        DashboardDto dashboard = DashboardDto.builder()
                .totalRooms(totalRooms)
                .rentedRooms(rentedRooms)
                .outstandingInvoices(outstandingInvoices)
                .openMaintenance(openMaintenance)
                .rooms(rooms)
                .occupancyRate(occupancyRate)
                .monthlyRevenue(revenue)
                .maintenanceTasks(maintenanceTasks)
                .outstandingInvoicesList(outstandingList)
                .build();

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/admin/rooms")
    public ResponseEntity<List<RoomDto>> getAllRooms() {
        return ResponseEntity.ok(roomService.findAll());
    }

    @GetMapping("/admin/rooms/{id}")
    public ResponseEntity<RoomDto> getRoomById(@PathVariable String id) {
        return ResponseEntity.ok(roomService.findById(id));
    }

    @GetMapping("/admin/tenant")
    public List<TenantsManagement> getAllTenants() {
        return dashboardService.getAllTenants();
    }

    @GetMapping("/admin/tenant/{id}")
    public TenantsManagement getTenant(@PathVariable String id) {
        return dashboardService.getTenantDetail(id);
    }

    @GetMapping("/admin/invoice")
    public ResponseEntity<List<InvoiceDetailDto>> getAllInvoices() {
        List<Invoice> invoices = invoiceService.getAllInvoices();
        List<InvoiceDetailDto> dtoList = invoices.stream()
                .map(invoiceService::toInvoiceDetailDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/admin/invoice/{id}")
    public ResponseEntity<InvoiceDetailDto> getInvoiceById(@PathVariable String id) {
        Invoice invoice = invoiceService.getInvoiceById(id);
        InvoiceDetailDto dto = invoiceService.toInvoiceDetailDto(invoice);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/admin/payment")
    public ResponseEntity<List<PaymentDashboardDto>> getAllPayments() {
        List<PaymentDashboardDto> data = paymentService.getAllPayments();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/admin/payment/{id}")
    public ResponseEntity<PaymentDashboardDto> getPaymentById(@PathVariable String id) {
        PaymentDashboardDto dto = paymentService.getPaymentById(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/admin/report")
    public ResponseEntity<ReportDashboardDto> getReport(@RequestParam(required = false) String month) {
        if (month == null || month.isEmpty()) {
            month = java.time.YearMonth.now().toString(); // ใช้เดือนปัจจุบัน
        }
        ReportDashboardDto report = reportDashboardService.getReportDashboard(month);
        return ResponseEntity.ok(report);
    }
}
