package com.example.apartmentmanagement.controller;
import com.example.apartmentmanagement.dto.*;
import com.example.apartmentmanagement.model.*;
import com.example.apartmentmanagement.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DashboardControllerTest {

    @Mock
    private DashboardService dashboardService;
    @Mock
    private ReportDashboardService reportDashboardService;
    @Mock
    private RoomService roomService;
    @Mock
    private InvoiceService invoiceService;
    @Mock
    private MaintenanceLogService maintenanceService;
    @Mock
    private TenantService tenantService;
    @Mock
    private RoomTypeService roomTypeService;

    @InjectMocks
    private DashboardController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getHomeDashboard_returnsCorrectDto() {
        when(roomService.countRooms()).thenReturn(10);
        when(roomService.countRentedRooms()).thenReturn(6);
        when(tenantService.countTenants()).thenReturn(8);
        RoomType type = RoomType.builder().name("Deluxe").price(BigDecimal.valueOf(1000)).build();
        when(roomTypeService.findAll()).thenReturn(List.of(type));

        var response = controller.getHomeDashboard();
        HomeDashboardDto dto = response.getBody();

        assertEquals(10, dto.getCountRooms());
        assertEquals(6, dto.getCountRentedRooms());
        assertEquals(8, dto.getCountTenants());
        assertEquals(1, dto.getRoomTypes().size());
        assertEquals("Deluxe", dto.getRoomTypes().get(0).getName());
    }

    @Test
    void getRoomDashboard_returnsApiResponse() {
        RoomDashboardDto dto = new RoomDashboardDto();

        when(dashboardService.getRoomDashboard("101", "2025-04", "2025-09"))
                .thenReturn(dto);

        var response = controller.getRoomDashboard("101", "2025-04", "2025-09");
        ApiResponse<RoomDashboardDto> body = response.getBody();

        assertTrue(body.isSuccess());
        assertEquals(dto, body.getData());
    }

    @Test
    void getOutstanding_returnsRoomOutstandingDto() {
        RoomOutstandingDto dto = new RoomOutstandingDto();
        when(dashboardService.getOutstandingByRoomNum("R101")).thenReturn(dto);

        var response = controller.getOutstanding("R101");
        assertEquals(dto, response.getBody());
    }

    @Test
    void getMaintenanceLogs_returnsList() {
        MaintenanceLog log = new MaintenanceLog();
        when(dashboardService.getMaintenanceLogsByRoom("R101")).thenReturn(List.of(log));

        var response = controller.getMaintenanceLogs("R101");
        assertEquals(1, response.getBody().size());
        assertEquals(log, response.getBody().get(0));
    }

    @Test
    void getDashboardAdmin_returnsDashboardDto() {
        when(roomService.countRooms()).thenReturn(10);
        when(roomService.countRentedRooms()).thenReturn(6);
        when(invoiceService.countOutstandingInvoices()).thenReturn(3);
        when(maintenanceService.countOpenTasks()).thenReturn(2);
        when(roomService.getRoomStatuses()).thenReturn(List.of());
        when(invoiceService.getRevenueThisMonth()).thenReturn(BigDecimal.valueOf(5000));
        when(maintenanceService.getOpenTasks()).thenReturn(List.of());
        when(invoiceService.getOutstandingInvoices()).thenReturn(List.of());

        var response = controller.getDashboardAdmin();
        DashboardDto dto = response.getBody();

        assertEquals(10, dto.getTotalRooms());
        assertEquals(6, dto.getRentedRooms());
        assertEquals(3, dto.getOutstandingInvoices());
        assertEquals(2, dto.getOpenMaintenance());
        assertEquals(0, dto.getRooms().size());
        assertEquals(5000, dto.getMonthlyRevenue().intValue());
    }

    @Test
    void getAllRooms_returnsList() {
        RoomDto r = RoomDto.builder().roomNum("101").build();
        when(roomService.findAll()).thenReturn(List.of(r));

        var response = controller.getAllRooms();
        assertEquals(1, response.getBody().size());
        assertEquals("101", response.getBody().get(0).getRoomNum());
    }

    @Test
    void getRoomById_returnsRoomDto() {
        RoomDto r = RoomDto.builder().roomNum("102").build();
        when(roomService.findById("102")).thenReturn(r);

        var response = controller.getRoomById("102");
        assertEquals("102", response.getBody().getRoomNum());
    }

    @Test
    void getAllTenants_returnsList() {
        TenantsManagement t = new TenantsManagement();
        when(dashboardService.getAllTenants()).thenReturn(List.of(t));

        var list = controller.getAllTenants();
        assertEquals(1, list.size());
        assertEquals(t, list.get(0));
    }

    @Test
    void getTenant_returnsTenant() {
        TenantsManagement t = new TenantsManagement();
        when(dashboardService.getTenantDetail("T001")).thenReturn(t);

        var tenant = controller.getTenant("T001");
        assertEquals(t, tenant);
    }

    @Test
    void getAllInvoices_returnsInvoiceDetailDtoList() {
        Invoice inv = new Invoice();
        InvoiceDetailDto dto = new InvoiceDetailDto();
        when(invoiceService.getAllInvoices()).thenReturn(List.of(inv));
        when(invoiceService.toInvoiceDetailDto(inv)).thenReturn(dto);

        var response = controller.getAllInvoices();
        assertEquals(1, response.getBody().size());
        assertEquals(dto, response.getBody().get(0));
    }

    @Test
    void getInvoiceById_returnsInvoiceDetailDto() {
        Invoice inv = new Invoice();
        InvoiceDetailDto dto = new InvoiceDetailDto();
        when(invoiceService.getInvoiceById("I001")).thenReturn(inv);
        when(invoiceService.toInvoiceDetailDto(inv)).thenReturn(dto);

        var response = controller.getInvoiceById("I001");
        assertEquals(dto, response.getBody());
    }

    @Test
    void getReport_returnsReportDashboardDto() {
        ReportDashboardDto report = new ReportDashboardDto();
        when(reportDashboardService.getReportDashboard(anyString())).thenReturn(report);

        var response = controller.getReport(null); // test default month
        assertEquals(report, response.getBody());
    }

    @Test
    void getReport_withNullMonth_usesCurrentMonth() {
        ReportDashboardDto report = new ReportDashboardDto();
        when(reportDashboardService.getReportDashboard(anyString())).thenReturn(report);

        // month = null
        var response = controller.getReport(null);

        verify(reportDashboardService).getReportDashboard(anyString());
        assertEquals(report, response.getBody());
    }

    @Test
    void getReport_withEmptyMonth_usesCurrentMonth() {
        ReportDashboardDto report = new ReportDashboardDto();
        when(reportDashboardService.getReportDashboard(anyString())).thenReturn(report);

        // month = empty string
        var response = controller.getReport("");

        verify(reportDashboardService).getReportDashboard(anyString());
        assertEquals(report, response.getBody());
    }

    @Test
    void getReport_withValidMonth_passesMonth() {
        ReportDashboardDto report = new ReportDashboardDto();
        when(reportDashboardService.getReportDashboard("2025-10")).thenReturn(report);

        var response = controller.getReport("2025-10");

        verify(reportDashboardService).getReportDashboard("2025-10");
        assertEquals(report, response.getBody());
    }

}
