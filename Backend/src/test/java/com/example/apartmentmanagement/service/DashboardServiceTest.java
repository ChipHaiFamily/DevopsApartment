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
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DashboardServiceTest {

    @Mock private RoomRepository roomRepo;
    @Mock private ContractRepository contractRepo;
    @Mock private InvoiceRepository invoiceRepo;
    @Mock private MaintenanceLogRepository maintenanceRepo;
    @Mock private TenantRepository tenantRepo;
    @Mock private MeterRepository meterRepo;
    @Mock private SuppliesRepository suppliesRepo;

    @InjectMocks private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
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
    void getRoomDashboard_multipleMeters_sumConsumption() {
        String roomNum = "201";
        Room room = new Room();
        room.setRoomNum(roomNum);

        Tenant tenant = new Tenant();
        tenant.setTenantId("T201");
        Contract contract = new Contract();
        contract.setTenant(tenant);
        contract.setStatus("active");
        contract.setStartDate(LocalDate.now().minusDays(5));

        when(roomRepo.findById(roomNum)).thenReturn(Optional.of(room));
        when(contractRepo.findByRoomRoomNumAndStatus(roomNum, "active")).thenReturn(Optional.of(contract));
        when(invoiceRepo.findTotalUnpaidByTenant("T201")).thenReturn(BigDecimal.valueOf(100));
        when(maintenanceRepo.countByRoomRoomNumAndStatus(anyString(), anyString())).thenReturn(2L);
        when(meterRepo.findByRoomAndRecordDateBetween(anyString(), any(), any())).thenReturn(List.of(
                new Meter(){{
                    setType("water"); setUnit(5); setRecordDate(LocalDate.now()); setRoom("201");
                }},
                new Meter(){{
                    setType("electricity"); setUnit(3); setRecordDate(LocalDate.now()); setRoom("201");
                }}
        ));

        RoomDashboardDto result = dashboardService.getRoomDashboard(roomNum, "2025-01", "2025-01");
        assertEquals(roomNum, result.getRoomNum());
        assertEquals(4, result.getMaintenanceCount());
        assertEquals(BigDecimal.valueOf(5), result.getConsumption().get(0).getWater());
        assertEquals(BigDecimal.valueOf(3), result.getConsumption().get(0).getElectric());
        assertEquals(BigDecimal.valueOf(8), result.getConsumption().get(0).getTotal());
    }

    @Test
    void getRoomDashboard_meterTypeOther_doesNotAddConsumption() {
        Room room = new Room(); room.setRoomNum("501");
        Tenant tenant = new Tenant(); tenant.setTenantId("T501");
        Contract contract = new Contract(); contract.setTenant(tenant); contract.setStatus("active"); contract.setStartDate(LocalDate.now().minusDays(10));

        when(roomRepo.findById("501")).thenReturn(Optional.of(room));
        when(contractRepo.findByRoomRoomNumAndStatus("501", "active")).thenReturn(Optional.of(contract));
        when(invoiceRepo.findTotalUnpaidByTenant("T501")).thenReturn(BigDecimal.ZERO);
        when(maintenanceRepo.countByRoomRoomNumAndStatus(anyString(), anyString())).thenReturn(0L);
        when(meterRepo.findByRoomAndRecordDateBetween(anyString(), any(), any())).thenReturn(List.of(
                new Meter(){{
                    setType("gas"); setUnit(10); setRecordDate(LocalDate.now()); setRoom("501");
                }}
        ));

        RoomDashboardDto result = dashboardService.getRoomDashboard("501", "2025-01", "2025-01");
        assertEquals(BigDecimal.valueOf(10), result.getConsumption().get(0).getTotal());
        assertEquals(BigDecimal.ZERO, result.getConsumption().get(0).getWater());
        assertEquals(BigDecimal.ZERO, result.getConsumption().get(0).getElectric());
    }

    @Test
    void getOutstandingByRoomNum_success_withPayments() {
        String roomNum = "201";
        Tenant tenant = new Tenant(); tenant.setTenantId("USR-001");
        Contract contract = new Contract(); contract.setTenant(tenant); contract.setStatus("active");

        Payment pay = new Payment(); pay.setPaymentDate(LocalDate.now());
        Invoice invoicePaid = new Invoice(); invoicePaid.setInvoiceId("INV-001"); invoicePaid.setStatus("paid"); invoicePaid.setTotalAmount(BigDecimal.valueOf(1000)); invoicePaid.setPayments(List.of(pay));
        Invoice invoiceUnpaid = new Invoice(); invoiceUnpaid.setInvoiceId("INV-002"); invoiceUnpaid.setStatus("unpaid"); invoiceUnpaid.setTotalAmount(BigDecimal.valueOf(500)); invoiceUnpaid.setPayments(Collections.emptyList());

        when(contractRepo.findByRoomRoomNumAndStatus(roomNum, "active")).thenReturn(Optional.of(contract));
        when(invoiceRepo.findByTenantTenantId("USR-001")).thenReturn(List.of(invoicePaid, invoiceUnpaid));
        when(invoiceRepo.findTotalUnpaidByTenant("USR-001")).thenReturn(null);

        RoomOutstandingDto result = dashboardService.getOutstandingByRoomNum(roomNum);

        assertEquals(roomNum, result.getRoomNum());
        assertEquals(BigDecimal.ZERO, result.getTotalOutstanding());
        assertEquals(2, result.getPayments().size());
    }

    @Test
    void getOutstandingByRoomNum_noContractFound_throws() {
        when(contractRepo.findByRoomRoomNumAndStatus("404", "active")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> dashboardService.getOutstandingByRoomNum("404"));
    }

    @Test
    void getMaintenanceLogsByRoom_success() {
        String roomNum = "301";
        Room room = new Room(); room.setRoomNum(roomNum);
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

    // --- getTenantDetail ---
    @Test
    void getTenantDetail_success_multipleContracts() {
        User user = new User(); user.setFullName("Alice"); user.setSex("Female");
        Tenant tenant = new Tenant(); tenant.setTenantId("USR-001"); tenant.setUser(user);

        Contract c1 = new Contract(); c1.setContractNum("C1"); c1.setStatus("expired"); c1.setStartDate(LocalDate.now().minusDays(100)); c1.setEndDate(LocalDate.now().minusDays(50));
        Room room1 = new Room(); room1.setRoomNum("101"); c1.setRoom(room1); c1.setRentAmount(5000); c1.setDeposit(10000); c1.setBillingCycle("monthly");

        Contract c2 = new Contract(); c2.setContractNum("C2"); c2.setStatus("active"); c2.setStartDate(LocalDate.now().minusDays(10)); c2.setEndDate(LocalDate.now().plusDays(20));
        Room room2 = new Room(); room2.setRoomNum("102"); c2.setRoom(room2); c2.setRentAmount(6000); c2.setDeposit(12000); c2.setBillingCycle("monthly");

        tenant.setContract(List.of(c1, c2));
        when(tenantRepo.findById("USR-001")).thenReturn(Optional.of(tenant));

        TenantsManagement result = dashboardService.getTenantDetail("USR-001");

        assertEquals("USR-001", result.getTenantId());
        assertEquals("Alice", result.getName());
        assertEquals("active", result.getCurrentStatus());
        assertEquals(2, result.getContracts().size());
    }

    @Test
    void getTenantDetail_contractWithNullRoom_setsRoomNumberNull() {
        User user = new User(); user.setFullName("Charlie");
        Tenant tenant = new Tenant(); tenant.setTenantId("USR-NOROOM"); tenant.setUser(user);

        Contract contract = new Contract(); contract.setContractNum("C0"); contract.setStatus("inactive");
        contract.setRoom(null); contract.setStartDate(LocalDate.now().minusDays(30)); contract.setEndDate(LocalDate.now().minusDays(10));
        tenant.setContract(List.of(contract));

        when(tenantRepo.findById("USR-NOROOM")).thenReturn(Optional.of(tenant));

        TenantsManagement result = dashboardService.getTenantDetail("USR-NOROOM");
        assertNull(result.getContracts().get(0).getRoomNumber());
    }

    @Test
    void getTenantDetail_noContract_setsUnknownStatus() {
        User user = new User(); user.setFullName("Bob");
        Tenant tenant = new Tenant(); tenant.setTenantId("USR-NULL"); tenant.setUser(user); tenant.setContract(Collections.emptyList());

        when(tenantRepo.findById("USR-NULL")).thenReturn(Optional.of(tenant));
        TenantsManagement result = dashboardService.getTenantDetail("USR-NULL");
        assertEquals("unknown", result.getCurrentStatus());
    }

    @Test
    void getTenantDetail_tenantNotFound_throws() {
        when(tenantRepo.findById("404")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> dashboardService.getTenantDetail("404"));
    }

    @Test
    void getAllTenants_success() {
        Tenant t1 = new Tenant(); t1.setTenantId("USR-001");
        Tenant t2 = new Tenant(); t2.setTenantId("USR-002");
        when(tenantRepo.findAll()).thenReturn(List.of(t1, t2));

        DashboardService spyService = spy(dashboardService);
        doReturn(new TenantsManagement()).when(spyService).getTenantDetail(anyString());

        List<TenantsManagement> result = spyService.getAllTenants();
        assertEquals(2, result.size());
    }

    @Test
    void getUsageByMonth_nullStartEndAndAllFloor() {
        Meter m1 = new Meter(); m1.setType("water"); m1.setUnit(5); m1.setRecordDate(LocalDate.of(2025, 1, 15)); m1.setRoom("101");
        when(meterRepo.findAll()).thenReturn(List.of(m1));
        Map<String, BigDecimal> result = dashboardService.getWaterUsageByMonth(null, null, "all");
        assertEquals(BigDecimal.valueOf(5), result.values().iterator().next());
    }

    @Test
    void getUsageByMonth_floorParseException() {
        Meter m1 = new Meter(); m1.setType("electricity"); m1.setUnit(7); m1.setRecordDate(LocalDate.of(2025, 1, 10)); m1.setRoom("X01");
        when(meterRepo.findAll()).thenReturn(List.of(m1));
        Map<String, BigDecimal> result = dashboardService.getElectricityUsageByMonth(null, null, "1");
        assertTrue(result.isEmpty());
    }

    @Test
    void getAllSupplies_quantityNull_setsZero() {
        Supplies s = new Supplies(); s.setItemId("S001"); s.setItem_Name("Paper"); s.setQuantity(null); s.setStatus("available");
        when(suppliesRepo.findAll()).thenReturn(List.of(s));
        List<DashboardDto.SupplyDto> result = dashboardService.getAllSupplies();
        assertEquals(0, result.get(0).getQuantity());
    }

    @Test
    void getWaterUsageByMonth_sumsCorrectly() {
        Meter m1 = new Meter();
        m1.setType("water");
        m1.setUnit(5);
        m1.setRecordDate(LocalDate.of(2025, 11, 1));

        Meter m2 = new Meter();
        m2.setType("water");
        m2.setUnit(3);
        m2.setRecordDate(LocalDate.of(2025, 11, 15));

        Meter m3 = new Meter();
        m3.setType("electricity");
        m3.setUnit(10);
        m3.setRecordDate(LocalDate.of(2025, 11, 10)); // ไม่ควรถูกนับ

        when(meterRepo.findAll()).thenReturn(List.of(m1, m2, m3));

        Map<String, BigDecimal> result = dashboardService.getWaterUsageByMonth();

        assertEquals(1, result.size());
        assertEquals(BigDecimal.valueOf(8), result.get("2025-11"));
    }

    @Test
    void getElectricityUsageByMonth_sumsCorrectly() {
        Meter m1 = new Meter();
        m1.setType("electricity");
        m1.setUnit(4);
        m1.setRecordDate(LocalDate.of(2025, 11, 1));

        Meter m2 = new Meter();
        m2.setType("electricity");
        m2.setUnit(6);
        m2.setRecordDate(LocalDate.of(2025, 11, 20));

        Meter m3 = new Meter();
        m3.setType("water");
        m3.setUnit(7);
        m3.setRecordDate(LocalDate.of(2025, 11, 5)); // ไม่ควรถูกนับ

        when(meterRepo.findAll()).thenReturn(List.of(m1, m2, m3));

        Map<String, BigDecimal> result = dashboardService.getElectricityUsageByMonth();

        assertEquals(1, result.size());
        assertEquals(BigDecimal.valueOf(10), result.get("2025-11"));
    }

}
