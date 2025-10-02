package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.RoomDashboardDto;
import com.example.apartmentmanagement.dto.RoomOutstandingDto;
import com.example.apartmentmanagement.dto.TenantsManagement;
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

    @InjectMocks
    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getRoomDashboard_success() {
        String roomNum = "101";
        Room room = new Room();
        room.setRoomNum(roomNum);
        room.setStatus("available");

        User user = new User();
        user.setFullName("John Doe");

        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-001");
        tenant.setUser(user);

        Contract contract = new Contract();
        contract.setContractNum("CTR-2025-001");
        contract.setRoom(room);
        contract.setTenant(tenant);
        contract.setStatus("active");
        contract.setStartDate(LocalDate.now().minusDays(10));

        InvoiceItem waterItem = new InvoiceItem();
        waterItem.setDescription("Water");
        waterItem.setAmount(BigDecimal.valueOf(100));

        InvoiceItem electricItem = new InvoiceItem();
        electricItem.setDescription("Electricity");
        electricItem.setAmount(BigDecimal.valueOf(200));

        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-2025-10-001");
        invoice.setIssueDate(LocalDate.now());
        invoice.setItems(Arrays.asList(waterItem, electricItem));

        when(roomRepo.findById(roomNum)).thenReturn(Optional.of(room));
        when(contractRepo.findByRoomRoomNumAndStatus(roomNum, "active")).thenReturn(Optional.of(contract));
        when(invoiceRepo.findTotalUnpaidByTenant("USR-001")).thenReturn(BigDecimal.valueOf(150));
        when(invoiceRepo.findTotalExpensesByTenant("USR-001")).thenReturn(300.0);
        when(invoiceRepo.findRecentInvoicesByTenant(eq("USR-001"), any(LocalDate.class))).thenReturn(Arrays.asList(invoice));
        when(maintenanceRepo.countByRoomRoomNumAndStatus(roomNum, "pending")).thenReturn(2L);

        RoomDashboardDto result = dashboardService.getRoomDashboard(roomNum);

        assertEquals(roomNum, result.getRoomNum());
        assertEquals("available", result.getStatus());
        assertEquals("USR-001", result.getTenantID());
        assertEquals(2, result.getMaintenanceCount());
        assertEquals(BigDecimal.valueOf(150), result.getTotalUnpaid());
        assertEquals(BigDecimal.valueOf(300.0), result.getTotalExpenses());
        assertEquals(1, result.getLast6Months().size());
        assertEquals(BigDecimal.valueOf(100), result.getLast6Months().get(0).getWater());
        assertEquals(BigDecimal.valueOf(200), result.getLast6Months().get(0).getElectric());
    }

    @Test
    void getRoomDashboard_roomNotFound_throwsException() {
        when(roomRepo.findById("999")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> dashboardService.getRoomDashboard("999"));
    }

    @Test
    void getRoomDashboard_noActiveContract_throwsException() {
        String roomNum = "101";
        Room room = new Room();
        room.setRoomNum(roomNum);

        when(roomRepo.findById(roomNum)).thenReturn(Optional.of(room));
        when(contractRepo.findByRoomRoomNumAndStatus(roomNum, "active")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> dashboardService.getRoomDashboard(roomNum));
    }

    @Test
    void getOutstandingByRoomNum_success() {
        String roomNum = "101";

        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-001");

        Contract contract = new Contract();
        contract.setContractNum("CTR-2025-001");
        contract.setRoom(new Room());
        contract.setTenant(tenant);
        contract.setStatus("active");

        Invoice invoice = new Invoice();
        invoice.setInvoiceId("INV-2025-10-001");
        invoice.setTotalAmount(BigDecimal.valueOf(500));
        invoice.setDueDate(LocalDate.now().plusDays(10));
        invoice.setStatus("unpaid");
        invoice.setPayments(Collections.emptyList());

        when(contractRepo.findByRoomRoomNumAndStatus(roomNum, "active")).thenReturn(Optional.of(contract));
        when(invoiceRepo.findByTenantTenantId("USR-001")).thenReturn(Arrays.asList(invoice));
        when(invoiceRepo.findTotalUnpaidByTenant("USR-001")).thenReturn(BigDecimal.valueOf(500));

        RoomOutstandingDto result = dashboardService.getOutstandingByRoomNum(roomNum);

        assertEquals(roomNum, result.getRoomNum());
        assertEquals(BigDecimal.valueOf(500), result.getTotalOutstanding());
        assertEquals(1, result.getPayments().size());
        assertEquals("ค้างชำระ", result.getPayments().get(0).getStatus());
    }

    @Test
    void getMaintenanceLogsByRoom_success() {
        String roomNum = "101";
        Room room = new Room();
        room.setRoomNum(roomNum);

        MaintenanceLog log1 = new MaintenanceLog();
        MaintenanceLog log2 = new MaintenanceLog();

        when(roomRepo.findById(roomNum)).thenReturn(Optional.of(room));
        when(maintenanceRepo.findByRoomRoomNumOrderByRequestDateDesc(roomNum)).thenReturn(Arrays.asList(log1, log2));

        List<MaintenanceLog> result = dashboardService.getMaintenanceLogsByRoom(roomNum);
        assertEquals(2, result.size());
    }

    @Test
    void getTenantDetail_success() {
        User user = new User();
        user.setFullName("John Doe");
        user.setSex("Male");
        user.setEmail("john@example.com");
        user.setTel("0812345678");
        user.setJob("Engineer");
        user.setWorkplace("CompanyX");

        Tenant tenant = new Tenant();
        tenant.setTenantId("USR-001");
        tenant.setUser(user);
        tenant.setEmergencyContact("0812345678");
        tenant.setEmergencyName("Jane Doe");
        tenant.setEmergencyRelationship("Wife");

        RoomType rt = new RoomType();
        rt.setPrice(BigDecimal.valueOf(5000));

        Room room = new Room();
        room.setRoomNum("101");
        room.setRoomType(rt);

        Contract contract = new Contract();
        contract.setContractNum("CTR-2025-001");
        contract.setStartDate(LocalDate.now().minusDays(10));
        contract.setEndDate(LocalDate.now().plusDays(20));
        contract.setRentAmount(rt.getPrice().doubleValue());
        contract.setDeposit(rt.getPrice().doubleValue() * 2);
        contract.setStatus("active");
        contract.setRoom(room);
        contract.setBillingCycle("monthly");

        tenant.setContract(Arrays.asList(contract));

        when(tenantRepo.findById("USR-001")).thenReturn(Optional.of(tenant));

        TenantsManagement result = dashboardService.getTenantDetail("USR-001");

        assertEquals("USR-001", result.getTenantId());
        assertEquals("John Doe", result.getName());
        assertEquals("active", result.getCurrentStatus());
        assertEquals(1, result.getContracts().size());
    }

    @Test
    void getAllTenants_success() {
        Tenant tenant1 = new Tenant();
        tenant1.setTenantId("USR-001");
        Tenant tenant2 = new Tenant();
        tenant2.setTenantId("USR-002");

        when(tenantRepo.findAll()).thenReturn(Arrays.asList(tenant1, tenant2));
        when(tenantRepo.findById("USR-001")).thenReturn(Optional.of(tenant1));
        when(tenantRepo.findById("USR-002")).thenReturn(Optional.of(tenant2));

        DashboardService spyService = spy(dashboardService);
        doReturn(mock(TenantsManagement.class)).when(spyService).getTenantDetail("USR-001");
        doReturn(mock(TenantsManagement.class)).when(spyService).getTenantDetail("USR-002");

        List<TenantsManagement> result = spyService.getAllTenants();
        assertEquals(2, result.size());
    }
}