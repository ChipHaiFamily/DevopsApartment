package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.MeterInvoiceDto;
import com.example.apartmentmanagement.dto.ReportDashboardDto;
import com.example.apartmentmanagement.model.*;
import com.example.apartmentmanagement.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReportDashboardServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private MaintenanceLogRepository maintenanceRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private MeterService meterService;

    @InjectMocks
    private ReportDashboardService reportDashboardService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetReport_basicScenario() {
        String month = "2025-11";

        Room room1 = new Room();
        room1.setRoomNum("R101");
        room1.setStatus("Occupied");

        Room room2 = new Room();
        room2.setRoomNum("R102");
        room2.setStatus("Vacant");

        when(roomRepository.findAll()).thenReturn(List.of(room1, room2));

        when(auditLogService.getByPeriod(month)).thenReturn(Collections.emptyList());

        Contract contract1 = new Contract();
        contract1.setContractNum("C001");
        contract1.setRoom(room1);

        Tenant tenant1 = new Tenant();
        User user1 = new User();
        user1.setFullName("John Doe");
        tenant1.setUser(user1);
        contract1.setTenant(tenant1);

        when(contractRepository.findAll()).thenReturn(List.of(contract1));

        MeterInvoiceDto.MeterDetail water = MeterInvoiceDto.MeterDetail.builder()
                .type("water")
                .unit(10)
                .build();

        MeterInvoiceDto.MeterDetail electricity = MeterInvoiceDto.MeterDetail.builder()
                .type("electricity")
                .unit(20)
                .build();

        MeterInvoiceDto meterData = MeterInvoiceDto.builder()
                .room("R101")
                .latestMeters(List.of(water, electricity))
                .build();

        when(meterService.getMetersForRoomAndMonth("R101", month)).thenReturn(meterData);
        when(meterService.getMetersForRoomAndMonth("R102", month)).thenReturn(null);

        Invoice invoice1 = new Invoice();
        invoice1.setInvoiceId("INV001");
        invoice1.setTotalAmount(BigDecimal.valueOf(1000));

        when(invoiceRepository.findAllById(anySet())).thenReturn(List.of(invoice1));

        MaintenanceLog log1 = new MaintenanceLog();
        log1.setLogId("M001");
        log1.setRoom(room1);
        log1.setCost(100.0);

        when(maintenanceRepository.findAllById(anySet())).thenReturn(List.of(log1));

        AuditLog invoiceLog = new AuditLog();
        invoiceLog.setTableName("invoice");
        invoiceLog.setRecordId("INV001");

        AuditLog maintenanceLog = new AuditLog();
        maintenanceLog.setTableName("maintenance_log");
        maintenanceLog.setRecordId("M001");

        when(auditLogService.getByPeriod(month)).thenReturn(List.of(invoiceLog, maintenanceLog));

        ReportDashboardDto result = reportDashboardService.getReport(month);

        assertEquals(50.0, result.getOccupancyRate());
        assertEquals(1000.0, result.getTotalIncome());
        assertEquals(100.0, result.getMaintenanceCost());
        assertEquals(900.0, result.getProfit());

        assertEquals(2, result.getRoomDetails().size());

        ReportDashboardDto.RoomDetailDto r101Detail = result.getRoomDetails().stream()
                .filter(r -> r.getRoomNum().equals("R101")).findFirst().orElse(null);
        assertNotNull(r101Detail);
        assertEquals("John Doe", r101Detail.getTenantName());
        assertEquals(BigDecimal.valueOf(10), r101Detail.getWaterUsage());
        assertEquals(BigDecimal.valueOf(20), r101Detail.getElectricityUsage());
        assertEquals(1, r101Detail.getMaintenanceCount());

        ReportDashboardDto.RoomDetailDto r102Detail = result.getRoomDetails().stream()
                .filter(r -> r.getRoomNum().equals("R102")).findFirst().orElse(null);
        assertNotNull(r102Detail);
        assertNull(r102Detail.getTenantName());
        assertEquals(BigDecimal.ZERO, r102Detail.getWaterUsage());
        assertEquals(BigDecimal.ZERO, r102Detail.getElectricityUsage());
        assertEquals(0, r102Detail.getMaintenanceCount());
    }

    @Test
    void getReport_noRooms_returnsZeroOccupancy() {
        when(roomRepository.findAll()).thenReturn(Collections.emptyList());
        when(auditLogService.getByPeriod("2025-11")).thenReturn(Collections.emptyList());

        ReportDashboardDto result = reportDashboardService.getReport("2025-11");

        assertEquals(0.0, result.getOccupancyRate());
        assertTrue(result.getRoomDetails().isEmpty());
        assertEquals(0.0, result.getTotalIncome());
        assertEquals(0.0, result.getMaintenanceCost());
        assertEquals(0.0, result.getProfit());
    }

    @Test
    void getReport_allRoomsVacant_occupancyZero() {
        Room room = new Room();
        room.setRoomNum("R201");
        room.setStatus("Vacant");

        when(roomRepository.findAll()).thenReturn(List.of(room));
        when(auditLogService.getByPeriod("2025-11")).thenReturn(Collections.emptyList());
        when(contractRepository.findAll()).thenReturn(Collections.emptyList());
        when(meterService.getLatestMetersWithRoomPrice("R201")).thenReturn(null);

        ReportDashboardDto result = reportDashboardService.getReport("2025-11");

        assertEquals(0.0, result.getOccupancyRate());
        assertEquals(1, result.getRoomDetails().size());
        ReportDashboardDto.RoomDetailDto detail = result.getRoomDetails().get(0);
        assertNull(detail.getTenantName());
        assertEquals(BigDecimal.ZERO, detail.getWaterUsage());
        assertEquals(BigDecimal.ZERO, detail.getElectricityUsage());
        assertEquals(0, detail.getMaintenanceCount());
    }

    @Test
    void getReport_meterServiceReturnsNull_orEmptyMeters() {
        Room room = new Room();
        room.setRoomNum("R301");
        room.setStatus("Occupied");

        when(roomRepository.findAll()).thenReturn(List.of(room));
        when(contractRepository.findAll()).thenReturn(Collections.emptyList());
        when(auditLogService.getByPeriod("2025-11")).thenReturn(Collections.emptyList());

        when(meterService.getLatestMetersWithRoomPrice("R301")).thenReturn(null);

        ReportDashboardDto result = reportDashboardService.getReport("2025-11");

        ReportDashboardDto.RoomDetailDto detail = result.getRoomDetails().get(0);

        assertEquals(BigDecimal.ZERO, detail.getWaterUsage());
        assertEquals(BigDecimal.ZERO, detail.getElectricityUsage());

        assertNull(detail.getTenantName());

        assertEquals(0, detail.getMaintenanceCount());
    }

    @Test
    void extractIdsForTable_handlesSingularAndPlural() {
        AuditLog log1 = new AuditLog();
        log1.setTableName("invoice");
        log1.setRecordId("INV001");

        AuditLog log2 = new AuditLog();
        log2.setTableName("invoices"); // plural
        log2.setRecordId("INV002");

        when(auditLogService.getByPeriod("2025-11")).thenReturn(List.of(log1, log2));
        when(roomRepository.findAll()).thenReturn(Collections.emptyList());
        when(invoiceRepository.findAllById(Set.of("INV001","INV002"))).thenReturn(Collections.emptyList());

        ReportDashboardDto result = reportDashboardService.getReport("2025-11");

        assertEquals(0, result.getInvoices().size());
    }
}