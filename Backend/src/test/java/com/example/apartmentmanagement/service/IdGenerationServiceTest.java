package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.*;
import com.example.apartmentmanagement.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class IdGenerationServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private MaintenanceScheduleRepository mtncSchRepository;
    @Mock
    private MaintenanceLogRepository mtncLogRepository;
    @Mock
    private ContractRepository contractRepository;
    @Mock
    private SuppliesRepository suppliesRepository;
    @Mock
    private SuppliesHistoryRepository suppliesHistoryRepository;


    @InjectMocks
    private IdGenerationService idGenerationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void generateUserId_firstId() {
        when(userRepository.findTopByOrderByIdDesc()).thenReturn(Optional.empty());

        String id = idGenerationService.generateUserId();
        assertEquals("USR-001", id);
    }

    @Test
    void generateReservationId_lastIdDifferentYear() {
        int lastYear = LocalDate.now().getYear() - 1;
        Reservation last = new Reservation();
        last.setReservationNum(String.format("RSV-%d-010", lastYear)); // ปีเก่า
        when(reservationRepository.findTopByOrderByReservationNumDesc()).thenReturn(Optional.of(last));

        String id = idGenerationService.generateReservationId();

        int currentYear = LocalDate.now().getYear();
        assertEquals(String.format("RSV-%d-001", currentYear), id);
    }

    @Test
    void generatePaymentId_lastIdDifferentMonth() {
        LocalDate now = LocalDate.now();
        LocalDate lastMonth = now.minusMonths(1);

        Payment last = new Payment();
        last.setPaymentId(String.format("PAY-%d-%02d-010", lastMonth.getYear(), lastMonth.getMonthValue())); // เดือนก่อนหน้า
        when(paymentRepository.findTopByOrderByPaymentIdDesc()).thenReturn(Optional.of(last));

        String id = idGenerationService.generatePaymentId();
        assertEquals(String.format("PAY-%d-%02d-001", now.getYear(), now.getMonthValue()), id);
    }

    @Test
    void generateUserId_nextId() {
        User lastUser = new User();
        lastUser.setId("USR-005");
        when(userRepository.findTopByOrderByIdDesc()).thenReturn(Optional.of(lastUser));

        String id = idGenerationService.generateUserId();
        assertEquals("USR-006", id);
    }

    @Test
    void generateReservationId_firstId() {
        when(reservationRepository.findTopByOrderByReservationNumDesc()).thenReturn(Optional.empty());

        int year = LocalDate.now().getYear();
        String id = idGenerationService.generateReservationId();
        assertEquals(String.format("RSV-%d-001", year), id);
    }

    @Test
    void generateReservationId_nextId() {
        int year = LocalDate.now().getYear();
        Reservation last = new Reservation();
        last.setReservationNum(String.format("RSV-%d-005", year));
        when(reservationRepository.findTopByOrderByReservationNumDesc()).thenReturn(Optional.of(last));

        String id = idGenerationService.generateReservationId();
        assertEquals(String.format("RSV-%d-006", year), id);
    }

    @Test
    void generatePaymentId_firstId() {
        when(paymentRepository.findTopByOrderByPaymentIdDesc()).thenReturn(Optional.empty());

        LocalDate now = LocalDate.now();
        String id = idGenerationService.generatePaymentId();
        assertEquals(String.format("PAY-%d-%02d-001", now.getYear(), now.getMonthValue()), id);
    }

    @Test
    void generatePaymentId_nextId() {
        LocalDate now = LocalDate.now();
        Payment last = new Payment();
        last.setPaymentId(String.format("PAY-%d-%02d-003", now.getYear(), now.getMonthValue()));
        when(paymentRepository.findTopByOrderByPaymentIdDesc()).thenReturn(Optional.of(last));

        String id = idGenerationService.generatePaymentId();
        assertEquals(String.format("PAY-%d-%02d-004", now.getYear(), now.getMonthValue()), id);
    }

    @Test
    void generateInvoiceId_firstId() {
        when(invoiceRepository.findTopByOrderByInvoiceIdDesc()).thenReturn(Optional.empty());

        LocalDate now = LocalDate.now();
        String id = idGenerationService.generateInvoiceId();
        assertEquals(String.format("INV-%d-%02d-001", now.getYear(), now.getMonthValue()), id);
    }

    @Test
    void generateInvoiceId_nextId() {
        LocalDate now = LocalDate.now();
        Invoice last = new Invoice();
        last.setInvoiceId(String.format("INV-%d-%02d-002", now.getYear(), now.getMonthValue()));
        when(invoiceRepository.findTopByOrderByInvoiceIdDesc()).thenReturn(Optional.of(last));

        String id = idGenerationService.generateInvoiceId();
        assertEquals(String.format("INV-%d-%02d-003", now.getYear(), now.getMonthValue()), id);
    }

    @Test
    void generateMtncSchId_firstId() {
        when(mtncSchRepository.findTopByOrderByScheduleIdDesc()).thenReturn(Optional.empty());

        int year = LocalDate.now().getYear();
        String id = idGenerationService.generateMtncSchId();
        assertEquals(String.format("MS-%d-001", year), id);
    }

    @Test
    void generateMtncSchId_nextId() {
        int year = LocalDate.now().getYear();
        MaintenanceSchedule last = new MaintenanceSchedule();
        last.setScheduleId(String.format("MS-%d-010", year));
        when(mtncSchRepository.findTopByOrderByScheduleIdDesc()).thenReturn(Optional.of(last));

        String id = idGenerationService.generateMtncSchId();
        assertEquals(String.format("MS-%d-011", year), id);
    }

    @Test
    void generateMtncLogId_firstId() {
        when(mtncLogRepository.findTopByOrderByLogIdDesc()).thenReturn(Optional.empty());

        int year = LocalDate.now().getYear();
        String id = idGenerationService.generateMtncLogId();
        assertEquals(String.format("ML-%d-001", year), id);
    }

    @Test
    void generateMtncLogId_nextId() {
        int year = LocalDate.now().getYear();
        MaintenanceLog last = new MaintenanceLog();
        last.setLogId(String.format("ML-%d-007", year));
        when(mtncLogRepository.findTopByOrderByLogIdDesc()).thenReturn(Optional.of(last));

        String id = idGenerationService.generateMtncLogId();
        assertEquals(String.format("ML-%d-008", year), id);
    }

    @Test
    void generateContractId_firstId() {
        when(contractRepository.findTopByOrderByContractNumDesc()).thenReturn(Optional.empty());

        int year = LocalDate.now().getYear();
        String id = idGenerationService.generateContractId();
        assertEquals(String.format("CTR-%d-001", year), id);
    }

    @Test
    void generateContractId_nextId() {
        int year = LocalDate.now().getYear();
        Contract last = new Contract();
        last.setContractNum(String.format("CTR-%d-004", year));
        when(contractRepository.findTopByOrderByContractNumDesc()).thenReturn(Optional.of(last));

        String id = idGenerationService.generateContractId();
        assertEquals(String.format("CTR-%d-005", year), id);
    }

    @Test
    void generateSupplyId_firstId() {
        when(suppliesRepository.findTopByOrderByItemIdDesc()).thenReturn(Optional.empty());
        String id = idGenerationService.generateSupplyId();
        assertEquals("ITM-001", id);
    }

    @Test
    void generateSupplyId_nextId() {
        Supplies last = new Supplies();
        last.setItemId("ITM-007");
        when(suppliesRepository.findTopByOrderByItemIdDesc()).thenReturn(Optional.of(last));
        String id = idGenerationService.generateSupplyId();
        assertEquals("ITM-008", id);
    }

    @Test
    void generateSupplyHistoryId_firstId() {
        when(suppliesHistoryRepository.findTopByOrderByHistoryIdDesc()).thenReturn(Optional.empty());
        LocalDate now = LocalDate.now();
        String id = idGenerationService.generateSupplyHistoryId();
        assertEquals(String.format("HIT-%d-%02d-001", now.getYear(), now.getMonthValue()), id);
    }

    @Test
    void generateSupplyHistoryId_nextId() {
        LocalDate now = LocalDate.now();
        SuppliesHistory last = new SuppliesHistory();
        last.setHistoryId(String.format("HIT-%d-%02d-004", now.getYear(), now.getMonthValue()));
        when(suppliesHistoryRepository.findTopByOrderByHistoryIdDesc()).thenReturn(Optional.of(last));
        String id = idGenerationService.generateSupplyHistoryId();
        assertEquals(String.format("HIT-%d-%02d-005", now.getYear(), now.getMonthValue()), id);
    }

    @Test
    void generateMeterId_firstId() {
        String room = "R101";
        String period = "2025-11";

        // lastId = null => เริ่มต้น 01
        String id = idGenerationService.generateMeterId(room, period, null);
        assertEquals("MTR-2025-11-R101-01", id);
    }

    @Test
    void generateMeterId_nextId() {
        String room = "R101";
        String period = "2025-11";
        String lastId = "MTR-2025-11-R101-05";

        String id = idGenerationService.generateMeterId(room, period, lastId);
        assertEquals("MTR-2025-11-R101-06", id);
    }

    @Test
    void generateMeterId_rollsCorrectlyOverDigits() {
        String room = "R102";
        String period = "2025-11";
        String lastId = "MTR-2025-11-R102-09";

        String id = idGenerationService.generateMeterId(room, period, lastId);
        assertEquals("MTR-2025-11-R102-10", id);
    }

    @Test
    void generateMeterId_differentRoomsAndPeriods() {
        String id1 = idGenerationService.generateMeterId("R201", "2025-10", null);
        String id2 = idGenerationService.generateMeterId("R202", "2025-12", "MTR-2025-12-R202-03");

        assertEquals("MTR-2025-10-R201-01", id1);
        assertEquals("MTR-2025-12-R202-04", id2);
    }

}