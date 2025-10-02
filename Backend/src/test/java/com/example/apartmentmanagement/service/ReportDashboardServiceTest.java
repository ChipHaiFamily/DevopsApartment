package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.ReportDashboardDto;
import com.example.apartmentmanagement.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReportDashboardServiceTest {

    @Mock
    private RoomRepository roomRepo;
    @Mock
    private ContractRepository contractRepo;
    @Mock
    private PaymentRepository paymentRepo;
    @Mock
    private MaintenanceLogRepository maintenanceRepo;

    @InjectMocks
    private ReportDashboardService reportService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getReportDashboard_returnsCorrectSummary() {
        String monthStr = "2025-10";

        LocalDate startDate = YearMonth.parse(monthStr).atDay(1);
        LocalDate endDate = YearMonth.parse(monthStr).atEndOfMonth();

        // --- mocks ---
        when(roomRepo.countAllRooms()).thenReturn(10);
        when(contractRepo.countActiveContractsDuring(startDate, endDate)).thenReturn(7);
        when(paymentRepo.sumRevenueByDateBetween(startDate, endDate)).thenReturn(BigDecimal.valueOf(50000));
        when(maintenanceRepo.sumCostByDateBetween(startDate, endDate)).thenReturn(BigDecimal.valueOf(15000));
        when(roomRepo.findAllRoomTypeNames()).thenReturn(List.of("Single", "Double"));
        when(roomRepo.countByTypeName("Single")).thenReturn(5);
        when(roomRepo.countByTypeName("Double")).thenReturn(5);
        List<Object[]> mockMaintenanceData = new ArrayList<>();
        mockMaintenanceData.add(new Object[]{"Plumbing", 3, 3000.0});
        when(maintenanceRepo.findMaintenanceSummaryByDateBetween(startDate, endDate))
                .thenReturn(mockMaintenanceData);


        ReportDashboardDto dto = reportService.getReportDashboard(monthStr);

        // --- assertions ---
        assertEquals(monthStr, dto.getMonth());
        assertNotNull(dto.getSummary());
        assertEquals(70, dto.getSummary().getOccupancyRate());
        assertEquals(BigDecimal.valueOf(50000), dto.getSummary().getTotalRevenue());
        assertEquals(BigDecimal.valueOf(15000), dto.getSummary().getMaintenanceCost());
        assertEquals(BigDecimal.valueOf(35000), dto.getSummary().getNetProfit());

        assertEquals(12, dto.getMonthlyRevenue().size());
        assertEquals(12, dto.getMonthlyOccupancy().size());

        assertEquals(2, dto.getRoomEfficiency().size());
        assertEquals("Single", dto.getRoomEfficiency().get(0).getType());

        assertEquals(1, dto.getMaintenanceWorks().size());
        assertEquals("Plumbing", dto.getMaintenanceWorks().get(0).getType());
        assertEquals(3, dto.getMaintenanceWorks().get(0).getCount());
        assertEquals(BigDecimal.valueOf(3000.0), dto.getMaintenanceWorks().get(0).getCost());
    }
}
