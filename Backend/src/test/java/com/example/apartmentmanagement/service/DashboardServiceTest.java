package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.*;
import com.example.apartmentmanagement.exception.ResourceNotFoundException;
import com.example.apartmentmanagement.model.*;
import com.example.apartmentmanagement.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DashboardServiceTest {

    @Mock
    private RoomRepository roomRepo;
    @Mock
    private ContractRepository contractRepo;
    @Mock
    private InvoiceRepository invoiceRepo;
    @Mock
    private MaintenanceLogRepository maintenanceRepo;
    @Mock
    private TenantRepository tenantRepo;
    @Mock
    private MeterRepository meterRepo;

    @InjectMocks
    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getRoomDashboard_success_withMixedItems() {
        String roomNum = "101";
        String startMonth = "2025-05";
        String endMonth = "2025-05";

        Room room = new Room();
        room.setRoomNum(roomNum);
        room.setStatus("available");

        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-001");

        Contract contract = new Contract();
        contract.setTenant(tenant);
        contract.setStatus("active");
        contract.setStartDate(LocalDate.now().minusDays(5));

        Meter waterMeter = new Meter();
        waterMeter.setRoom(roomNum);
        waterMeter.setType("water");
        waterMeter.setUnit(100);
        waterMeter.setRecordDate(LocalDate.of(2025, 5, 15));

        Meter electricMeter = new Meter();
        electricMeter.setRoom(roomNum);
        electricMeter.setType("electricity");
        electricMeter.setUnit(200);
        electricMeter.setRecordDate(LocalDate.of(2025, 5, 15));

        when(roomRepo.findById(roomNum)).thenReturn(Optional.of(room));
        when(contractRepo.findByRoomRoomNumAndStatus(roomNum, "active")).thenReturn(Optional.of(contract));
        when(invoiceRepo.findTotalUnpaidByTenant("USR-001")).thenReturn(null);
        when(invoiceRepo.findTotalExpensesByTenant("USR-001")).thenReturn(null);
        when(maintenanceRepo.countByRoomRoomNumAndStatus(roomNum, "pending")).thenReturn(0L);
        when(meterRepo.findByRoomAndRecordDateBetween(roomNum,
                LocalDate.parse(startMonth + "-01"),
                YearMonth.parse(endMonth).atEndOfMonth()))
                .thenReturn(List.of(waterMeter, electricMeter));

        RoomDashboardDto result = dashboardService.getRoomDashboard(roomNum, startMonth, endMonth);

        assertEquals("available", result.getStatus());
        assertEquals("USR-001", result.getTenantID());
        assertEquals(BigDecimal.ZERO, result.getTotalUnpaid());
        assertEquals(BigDecimal.ZERO, result.getTotalExpenses());
        assertEquals(1, result.getLast6Months().size());
        assertEquals(BigDecimal.valueOf(100), result.getLast6Months().get(0).getWater());
        assertEquals(BigDecimal.valueOf(200), result.getLast6Months().get(0).getElectric());
        assertEquals(BigDecimal.valueOf(300), result.getLast6Months().get(0).getTotal());
    }

    @Test
    void getRoomDashboard_withNonNullTotals_success() {
        String roomNum = "101";
        String startMonth = "2025-05";
        String endMonth = "2025-05";

        Room room = new Room();
        room.setRoomNum(roomNum);
        room.setStatus("occupied");

        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-001");

        Contract contract = new Contract();
        contract.setTenant(tenant);
        contract.setStatus("active");
        contract.setStartDate(LocalDate.now().minusDays(10));

        when(roomRepo.findById(roomNum)).thenReturn(Optional.of(room));
        when(contractRepo.findByRoomRoomNumAndStatus(roomNum, "active")).thenReturn(Optional.of(contract));
        when(invoiceRepo.findTotalUnpaidByTenant("USR-001")).thenReturn(BigDecimal.valueOf(1234.0));
        when(invoiceRepo.findTotalExpensesByTenant("USR-001")).thenReturn(5678.0);
        when(maintenanceRepo.countByRoomRoomNumAndStatus(roomNum, "pending")).thenReturn(2L);
        when(meterRepo.findByRoomAndRecordDateBetween(roomNum,
                LocalDate.parse(startMonth + "-01"),
                YearMonth.parse(endMonth).atEndOfMonth()))
                .thenReturn(Collections.emptyList());

        RoomDashboardDto result = dashboardService.getRoomDashboard(roomNum, startMonth, endMonth);

        assertEquals(BigDecimal.valueOf(1234.0), result.getTotalUnpaid());
        assertEquals(BigDecimal.valueOf(5678.0), result.getTotalExpenses());
        assertEquals(2, result.getMaintenanceCount());
        assertEquals(0, result.getLast6Months().size());
    }

    @Test
    void getRoomDashboard_itemAmountIsNull_treatedAsZero() {
        String roomNum = "404";
        String startMonth = "2025-05";
        String endMonth = "2025-05";

        Room room = new Room();
        room.setRoomNum(roomNum);
        room.setStatus("available");

        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-NULL-AMT");

        Contract contract = new Contract();
        contract.setTenant(tenant);
        contract.setStatus("active");
        contract.setStartDate(LocalDate.now().minusDays(5));

        Meter nullMeter = new Meter();
        nullMeter.setRoom(roomNum);
        nullMeter.setType("water");
        nullMeter.setUnit(0);
        nullMeter.setRecordDate(LocalDate.of(2025,5,15));

        when(roomRepo.findById(roomNum)).thenReturn(Optional.of(room));
        when(contractRepo.findByRoomRoomNumAndStatus(roomNum, "active")).thenReturn(Optional.of(contract));
        when(invoiceRepo.findTotalUnpaidByTenant("USR-NULL-AMT")).thenReturn(BigDecimal.ZERO);
        when(invoiceRepo.findTotalExpensesByTenant("USR-NULL-AMT")).thenReturn(0.0);
        when(maintenanceRepo.countByRoomRoomNumAndStatus(roomNum, "pending")).thenReturn(0L);
        when(meterRepo.findByRoomAndRecordDateBetween(roomNum,
                LocalDate.parse(startMonth + "-01"),
                YearMonth.parse(endMonth).atEndOfMonth()))
                .thenReturn(List.of(nullMeter));

        RoomDashboardDto result = dashboardService.getRoomDashboard(roomNum, startMonth, endMonth);

        assertEquals(BigDecimal.ZERO, result.getLast6Months().get(0).getTotal());
    }

    @Test
    void getRoomDashboard_roomNotFound() {
        when(roomRepo.findById("999")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () -> dashboardService.getRoomDashboard("999", "2025-01", "2025-01"));
    }

    @Test
    void getRoomDashboard_noActiveContract() {
        String roomNum = "101";
        when(roomRepo.findById(roomNum)).thenReturn(Optional.of(new Room()));
        when(contractRepo.findByRoomRoomNumAndStatus(roomNum, "active")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () -> dashboardService.getRoomDashboard(roomNum, "2025-01", "2025-01"));
    }

    @Test
    void getOutstandingByRoomNum_success_withPayments() {
        String roomNum = "201";

        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-001");

        Contract contract = new Contract();
        contract.setTenant(tenant);
        contract.setStatus("active");

        Payment pay = new Payment();
        pay.setPaymentDate(LocalDate.now());

        Invoice invoicePaid = new Invoice();
        invoicePaid.setInvoiceId("INV-001");
        invoicePaid.setStatus("paid");
        invoicePaid.setTotalAmount(BigDecimal.valueOf(1000));
        invoicePaid.setPayments(List.of(pay));

        Invoice invoiceUnpaid = new Invoice();
        invoiceUnpaid.setInvoiceId("INV-002");
        invoiceUnpaid.setStatus("unpaid");
        invoiceUnpaid.setTotalAmount(BigDecimal.valueOf(500));
        invoiceUnpaid.setPayments(Collections.emptyList());

        when(contractRepo.findByRoomRoomNumAndStatus(roomNum, "active")).thenReturn(Optional.of(contract));
        when(invoiceRepo.findByTenantTenantId("USR-001")).thenReturn(List.of(invoicePaid, invoiceUnpaid));
        when(invoiceRepo.findTotalUnpaidByTenant("USR-001")).thenReturn(null); // test null outstanding

        RoomOutstandingDto result = dashboardService.getOutstandingByRoomNum(roomNum);

        assertEquals(roomNum, result.getRoomNum());
        assertEquals(BigDecimal.ZERO, result.getTotalOutstanding());
        assertEquals(2, result.getPayments().size());
        assertTrue(result.getPayments().stream().anyMatch(p -> p.getStatus().equals("ชำระแล้ว")));
        assertTrue(result.getPayments().stream().anyMatch(p -> p.getStatus().equals("ค้างชำระ")));
    }

    @Test
    void getOutstandingByRoomNum_withNullPayments_success() {
        String roomNum = "303";
        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-303");

        Contract contract = new Contract();
        contract.setTenant(tenant);
        contract.setStatus("active");

        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-303");
        invoice.setStatus("unpaid");
        invoice.setTotalAmount(BigDecimal.valueOf(1000));
        invoice.setPayments(null);

        when(contractRepo.findByRoomRoomNumAndStatus(roomNum, "active")).thenReturn(Optional.of(contract));
        when(invoiceRepo.findByTenantTenantId("USR-303")).thenReturn(List.of(invoice));
        when(invoiceRepo.findTotalUnpaidByTenant("USR-303")).thenReturn(BigDecimal.valueOf(1000));

        RoomOutstandingDto result = dashboardService.getOutstandingByRoomNum(roomNum);

        assertEquals(BigDecimal.valueOf(1000), result.getTotalOutstanding());
        assertNull(result.getPayments().get(0).getPaidDate());
    }

    @Test
    void getOutstandingByRoomNum_noContractFound_throws() {
        when(contractRepo.findByRoomRoomNumAndStatus("404", "active")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> dashboardService.getOutstandingByRoomNum("404"));
    }

    @Test
    void getMaintenanceLogsByRoom_success() {
        String roomNum = "301";
        Room room = new Room();
        room.setRoomNum(roomNum);

        MaintenanceLog log1 = new MaintenanceLog();
        MaintenanceLog log2 = new MaintenanceLog();

        when(roomRepo.findById(roomNum)).thenReturn(Optional.of(room));
        when(maintenanceRepo.findByRoomRoomNumOrderByRequestDateDesc(roomNum)).thenReturn(List.of(log1, log2));

        List<MaintenanceLog> result = dashboardService.getMaintenanceLogsByRoom(roomNum);
        assertEquals(2, result.size());
    }

    @Test
    void getMaintenanceLogsByRoom_roomNotFound_throws() {
        when(roomRepo.findById("999")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> dashboardService.getMaintenanceLogsByRoom("999"));
    }

    @Test
    void getTenantDetail_success_multipleContracts() {
        User user = new User();
        user.setFullName("Alice");
        user.setSex("Female");
        user.setEmail("alice@mail.com");
        user.setTel("0999999999");
        user.setJob("Designer");
        user.setWorkplace("StudioX");

        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-001");
        tenant.setUser(user);

        Contract c1 = new Contract();
        c1.setContractNum("C1");
        c1.setStatus("expired");
        c1.setStartDate(LocalDate.now().minusDays(100));
        c1.setEndDate(LocalDate.now().minusDays(50));
        c1.setRentAmount(5000);
        c1.setDeposit(10000);
        c1.setBillingCycle("monthly");
        Room room1 = new Room();
        room1.setRoomNum("101");
        c1.setRoom(room1);

        Contract c2 = new Contract();
        c2.setContractNum("C2");
        c2.setStatus("active");
        c2.setStartDate(LocalDate.now().minusDays(10));
        c2.setEndDate(LocalDate.now().plusDays(20));
        c2.setRentAmount(6000);
        c2.setDeposit(12000);
        c2.setBillingCycle("monthly");
        Room room2 = new Room();
        room2.setRoomNum("102");
        c2.setRoom(room2);

        tenant.setContract(List.of(c1, c2));

        when(tenantRepo.findById("USR-001")).thenReturn(Optional.of(tenant));

        TenantsManagement result = dashboardService.getTenantDetail("USR-001");

        assertEquals("USR-001", result.getTenantId());
        assertEquals("Alice", result.getName());
        assertEquals("active", result.getCurrentStatus());
        assertEquals(2, result.getContracts().size());
        assertEquals("102", result.getContracts().get(1).getRoomNumber());
    }

    @Test
    void getTenantDetail_contractWithNullRoom_setsRoomNumberNull() {
        User user = new User();
        user.setFullName("Charlie");
        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-NOROOM");
        tenant.setUser(user);

        Contract contract = new Contract();
        contract.setContractNum("C0");
        contract.setStatus("inactive");
        contract.setStartDate(LocalDate.now().minusDays(30));
        contract.setEndDate(LocalDate.now().minusDays(10));
        contract.setRentAmount(4000);
        contract.setDeposit(8000);
        contract.setBillingCycle("monthly");
        contract.setRoom(null);

        tenant.setContract(List.of(contract));

        when(tenantRepo.findById("USR-NOROOM")).thenReturn(Optional.of(tenant));

        TenantsManagement result = dashboardService.getTenantDetail("USR-NOROOM");

        assertEquals(1, result.getContracts().size());
        assertNull(result.getContracts().get(0).getRoomNumber()); // ✅ null branch
    }


    @Test
    void getTenantDetail_noContract_setsUnknownStatus() {
        User user = new User();
        user.setFullName("Bob");
        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-NULL");
        tenant.setUser(user);
        tenant.setContract(Collections.emptyList());

        when(tenantRepo.findById("USR-NULL")).thenReturn(Optional.of(tenant));

        TenantsManagement result = dashboardService.getTenantDetail("USR-NULL");

        assertEquals("unknown", result.getCurrentStatus());
        assertEquals("Bob", result.getName());
    }


    @Test
    void getTenantDetail_tenantNotFound_throws() {
        when(tenantRepo.findById("404")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> dashboardService.getTenantDetail("404"));
    }

    @Test
    void getAllTenants_success() {
        Tenant t1 = new Tenant();
        t1.setTenantId("USR-001");
        Tenant t2 = new Tenant();
        t2.setTenantId("USR-002");

        when(tenantRepo.findAll()).thenReturn(List.of(t1, t2));

        DashboardService spyService = spy(dashboardService);
        doReturn(new TenantsManagement()).when(spyService).getTenantDetail(anyString());

        List<TenantsManagement> result = spyService.getAllTenants();
        assertEquals(2, result.size());
    }
}