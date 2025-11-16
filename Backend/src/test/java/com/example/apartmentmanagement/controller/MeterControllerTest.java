package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.dto.MeterInvoiceDto;
import com.example.apartmentmanagement.model.Meter;
import com.example.apartmentmanagement.model.Room;
import com.example.apartmentmanagement.repository.MeterRepository;
import com.example.apartmentmanagement.service.MeterService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class MeterControllerTest {

    @Mock
    private MeterService service;

    @Mock
    private MeterRepository repository;

    @InjectMocks
    private MeterController controller;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    }

    @Test
    void getAll_ReturnsMeters() throws Exception {
        Meter meter1 = new Meter();
        meter1.setMeterId("M1");
        Meter meter2 = new Meter();
        meter2.setMeterId("M2");
        when(service.getAllMeters()).thenReturn(Arrays.asList(meter1, meter2));

        mockMvc.perform(get("/api/meters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].meterId").value("M1"))
                .andExpect(jsonPath("$[1].meterId").value("M2"));

        verify(service, times(1)).getAllMeters();
    }

    @Test
    void getById_FoundAndNotFound() throws Exception {
        Meter meter = new Meter();
        meter.setMeterId("M1");
        when(repository.findById("M1")).thenReturn(Optional.of(meter));
        when(repository.findById("M2")).thenReturn(Optional.empty());

        // Found
        mockMvc.perform(get("/api/meters/M1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.meterId").value("M1"));

        // Not found
        mockMvc.perform(get("/api/meters/M2"))
                .andExpect(status().isNotFound());

        verify(repository, times(1)).findById("M1");
        verify(repository, times(1)).findById("M2");
    }

    @Test
    void getLatestMetersWithRoomPrice_ReturnsDto() throws Exception {
        MeterInvoiceDto dto = mock(MeterInvoiceDto.class);
        when(dto.getRoom()).thenReturn("101");
        when(dto.getRoomPrice()).thenReturn(new BigDecimal("1000"));
        when(dto.getLatestMeters()).thenReturn(Arrays.asList());

        when(service.getLatestMetersWithRoomPrice("101")).thenReturn(dto);

        mockMvc.perform(get("/api/meters/room/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.room").value("101"))
                .andExpect(jsonPath("$.roomPrice").value(1000));

        verify(service, times(1)).getLatestMetersWithRoomPrice("101");
    }


    @Test
    void createMeter_ValidAndInvalid() throws Exception {
        Meter meter = new Meter();
        meter.setRoom("R01");
        meter.setType("ELECTRIC");
        meter.setUnit(100);
        meter.setRecordDate(LocalDate.of(2025,11,16));
        meter.setPeriod("2025-11");

        Meter saved = new Meter();
        saved.setMeterId("M1");

        when(service.addMeter(meter.getRoom(), meter.getType(), meter.getUnit(), meter.getRecordDate(), meter.getPeriod()))
                .thenReturn(saved);

        // Valid
        mockMvc.perform(post("/api/meters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(meter)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.meterId").value("M1"));

        // Invalid (recordDate null)
        meter.setRecordDate(null);
        mockMvc.perform(post("/api/meters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(meter)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void uploadCsv_SuccessAndError() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "meters.csv", "text/csv", "data".getBytes());

        // Success
        doNothing().when(service).importMetersFromCsv(file);
        mockMvc.perform(multipart("/api/meters/upload").file(file))
                .andExpect(status().isOk())
                .andExpect(content().string("CSV imported successfully"));

        // Error
        doThrow(new RuntimeException("Invalid CSV")).when(service).importMetersFromCsv(file);
        mockMvc.perform(multipart("/api/meters/upload").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error: Invalid CSV"));
    }

    @Test
    void updateMeter_FoundAndNotFound() throws Exception {
        Meter existing = new Meter();
        existing.setMeterId("M1");
        existing.setRoom("R01");
        existing.setType("WATER");
        existing.setUnit(50);
        existing.setRecordDate(LocalDate.of(2025,11,1));
        existing.setPeriod("2025-11");

        Meter updated = new Meter();
        updated.setRoom("R02");
        updated.setType("ELECTRIC");
        updated.setUnit(100);
        updated.setRecordDate(LocalDate.of(2025,11,16));
        updated.setPeriod("2025-11");

        when(repository.findById("M1")).thenReturn(Optional.of(existing));
        when(repository.save(any(Meter.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(repository.findById("M2")).thenReturn(Optional.empty());

        // Found
        mockMvc.perform(put("/api/meters/M1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("ELECTRIC"))
                .andExpect(jsonPath("$.unit").value(100));

        // Not found
        mockMvc.perform(put("/api/meters/M2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteMeter_FoundAndNotFound() throws Exception {
        when(repository.existsById("M1")).thenReturn(true);
        when(repository.existsById("M2")).thenReturn(false);
        doNothing().when(repository).deleteById("M1");

        // Found
        mockMvc.perform(delete("/api/meters/M1"))
                .andExpect(status().isNoContent());

        // Not found
        mockMvc.perform(delete("/api/meters/M2"))
                .andExpect(status().isNotFound());

        verify(repository, times(1)).deleteById("M1");
        verify(repository, times(2)).existsById(anyString());
    }
}