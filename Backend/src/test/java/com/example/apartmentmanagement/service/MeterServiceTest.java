package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.MeterInvoiceDto;
import com.example.apartmentmanagement.model.Contract;
import com.example.apartmentmanagement.model.Meter;
import com.example.apartmentmanagement.model.MeterRate;
import com.example.apartmentmanagement.repository.ContractRepository;
import com.example.apartmentmanagement.repository.MeterRateRepository;
import com.example.apartmentmanagement.repository.MeterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MeterServiceTest {

    @Mock
    private MeterRepository repository;

    @Mock
    private MeterRateRepository meterRateRepository;

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private IdGenerationService idGenerationService;

    @InjectMocks
    private MeterService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllMeters() {
        Meter m1 = new Meter();
        Meter m2 = new Meter();
        when(repository.findAll()).thenReturn(List.of(m1, m2));

        List<Meter> result = service.getAllMeters();

        assertEquals(2, result.size());
    }

    @Test
    void testGetLatestMetersWithRoomPrice() {
        Meter meter = new Meter();
        meter.setMeterId("M001");
        meter.setRoom("R101");
        meter.setType("water");
        meter.setUnit(10);
        meter.setPeriod("2025-11");
        meter.setRecordDate(LocalDate.of(2025, 11, 1));

        when(repository.findByRoomOrderByRecordDateDesc("R101")).thenReturn(List.of(meter));

        Contract contract = new Contract();
        contract.setRentAmount(5000);
        when(contractRepository.findByRoom_RoomNumOrderByEndDateDesc("R101")).thenReturn(contract);

        MeterRate rate = new MeterRate();
        rate.setType("water");
        rate.setRate(2.0);
        when(meterRateRepository.findLatestRatesForAllTypes()).thenReturn(List.of(rate));

        MeterInvoiceDto dto = service.getLatestMetersWithRoomPrice("R101");

        assertEquals("R101", dto.getRoom());
        assertEquals(BigDecimal.valueOf(5000.0), dto.getRoomPrice());
        assertEquals(1, dto.getLatestMeters().size());
        assertEquals(BigDecimal.valueOf(20.0), dto.getLatestMeters().get(0).getTotalBill());
    }

    @Test
    void testAddMeter_NewMeter() {
        when(repository.findByRoomAndPeriodAndTypeAndRecordDate(anyString(), anyString(), anyString(), any()))
                .thenReturn(null);
        when(repository.findTopByPeriodAndRoomOrderByMeterIdDesc(anyString(), anyString()))
                .thenReturn(null);
        when(idGenerationService.generateMeterId(anyString(), anyString(), isNull()))
                .thenReturn("M001");

        Meter meterToSave = new Meter();
        when(repository.save(any(Meter.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Meter meter = service.addMeter("R101", "water", 10, LocalDate.of(2025, 11, 1), null);

        assertEquals("M001", meter.getMeterId());
        assertEquals("R101", meter.getRoom());
        assertEquals("water", meter.getType());
        assertEquals(10, meter.getUnit());
        assertEquals("2025-11", meter.getPeriod());
    }

    @Test
    void testAddMeter_ExistingMeter() {
        Meter existing = new Meter();
        existing.setUnit(5);
        when(repository.findByRoomAndPeriodAndTypeAndRecordDate(anyString(), anyString(), anyString(), any()))
                .thenReturn(existing);
        when(repository.save(existing)).thenAnswer(invocation -> invocation.getArgument(0));

        Meter updated = service.addMeter("R101", "water", 15, LocalDate.of(2025, 11, 1), "2025-11");

        assertEquals(15, updated.getUnit());
        verify(repository).save(existing);
    }

    @Test
    void importMetersFromCsv_savesMeters() throws Exception {
        String csvContent = "room,type,unit,recordDate,period\n" +
                "201,water,5,2025-11-01,2025-11\n" +
                "201,electricity,3,2025-11-01,2025-11";

        MultipartFile file = new MockMultipartFile(
                "file",
                "meters.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.importMetersFromCsv(file);

        verify(repository, times(2)).save(any());

        ArgumentCaptor<Meter> captor = ArgumentCaptor.forClass(Meter.class);
        verify(repository, times(2)).save(captor.capture());

        List<Meter> savedMeters = captor.getAllValues();

        Meter water = savedMeters.stream().filter(m -> m.getType().equals("water")).findFirst().orElse(null);
        Meter electricity = savedMeters.stream().filter(m -> m.getType().equals("electricity")).findFirst().orElse(null);

        assertNotNull(water);
        assertEquals("201", water.getRoom());
        assertEquals(5, water.getUnit());
        assertEquals(LocalDate.parse("2025-11-01"), water.getRecordDate());
        assertEquals("2025-11", water.getPeriod());

        assertNotNull(electricity);
        assertEquals("201", electricity.getRoom());
        assertEquals(3, electricity.getUnit());
        assertEquals(LocalDate.parse("2025-11-01"), electricity.getRecordDate());
        assertEquals("2025-11", electricity.getPeriod());
    }

    @Test
    void testAddMeter_BlankPeriodGeneratesFromRecordDate() {
        when(repository.findByRoomAndPeriodAndTypeAndRecordDate(anyString(), anyString(), anyString(), any()))
                .thenReturn(null);
        when(repository.findTopByPeriodAndRoomOrderByMeterIdDesc(anyString(), anyString()))
                .thenReturn(null);
        when(idGenerationService.generateMeterId(anyString(), anyString(), isNull()))
                .thenReturn("M001");
        when(repository.save(any(Meter.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Meter meter = service.addMeter("R101", "water", 10, LocalDate.of(2025, 11, 1), null);

        assertNotNull(meter);
        assertEquals("M001", meter.getMeterId());
        assertEquals("R101", meter.getRoom());
        assertEquals("water", meter.getType());
        assertEquals(10, meter.getUnit());
        assertEquals("2025-11", meter.getPeriod());
    }

    @Test
    void testGetLatestMetersWithRoomPrice_NoContractOrRate() {
        Meter meter = new Meter();
        meter.setMeterId("M003");
        meter.setRoom("R103");
        meter.setType("water");
        meter.setUnit(8);
        meter.setPeriod("2025-11");
        meter.setRecordDate(LocalDate.of(2025, 11, 5));

        when(repository.findByRoomOrderByRecordDateDesc("R103")).thenReturn(List.of(meter));
        when(contractRepository.findByRoom_RoomNumOrderByEndDateDesc("R103")).thenReturn(null);
        when(meterRateRepository.findLatestRatesForAllTypes()).thenReturn(List.of());

        MeterInvoiceDto dto = service.getLatestMetersWithRoomPrice("R103");

        assertEquals(BigDecimal.ZERO, dto.getRoomPrice());
        assertEquals(BigDecimal.ZERO, dto.getLatestMeters().get(0).getTotalBill());
    }

    @Test
    void importMetersFromCsv_EmptyFile() throws Exception {
        MultipartFile file = new MockMultipartFile(
                "file",
                "empty.csv",
                "text/csv",
                "".getBytes(StandardCharsets.UTF_8)
        );

        service.importMetersFromCsv(file);

        // Should not save anything
        verify(repository, never()).save(any());
    }

    @Test
    void importMetersFromCsv_InvalidHeader() {
        MultipartFile file = new MockMultipartFile(
                "file",
                "invalid.csv",
                "text/csv",
                "wrong,header\n1,2".getBytes(StandardCharsets.UTF_8)
        );

        assertThrows(Exception.class, () -> service.importMetersFromCsv(file));
    }

}