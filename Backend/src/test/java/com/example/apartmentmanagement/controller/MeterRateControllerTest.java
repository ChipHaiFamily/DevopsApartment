package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.MeterRate;
import com.example.apartmentmanagement.repository.MeterRateRepository;
import com.example.apartmentmanagement.service.MeterRateService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class MeterRateControllerTest {

    @Mock
    private MeterRateRepository repository;

    @Mock
    private MeterRateService service;

    @InjectMocks
    private MeterRateController controller;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
    }

    @Test
    void getAllRates_ReturnsList() throws Exception {
        MeterRate rate1 = new MeterRate();
        rate1.setId(1L);
        rate1.setType("ELECTRIC");
        rate1.setRate(2.5);
        rate1.setTimestamp(OffsetDateTime.now());

        MeterRate rate2 = new MeterRate();
        rate2.setId(2L);
        rate2.setType("WATER");
        rate2.setRate(1.2);
        rate2.setTimestamp(OffsetDateTime.now());

        List<MeterRate> list = Arrays.asList(rate1, rate2);
        when(repository.findAll()).thenReturn(list);

        mockMvc.perform(get("/api/meter-rate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].type").value("ELECTRIC"))
                .andExpect(jsonPath("$[0].rate").value(2.5))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].type").value("WATER"))
                .andExpect(jsonPath("$[1].rate").value(1.2));

        verify(repository, times(1)).findAll();
    }

    @Test
    void getHistory_ReturnsListByType() throws Exception {
        MeterRate rate = new MeterRate();
        rate.setId(1L);
        rate.setType("ELECTRIC");
        rate.setRate(2.5);
        rate.setTimestamp(OffsetDateTime.now());

        when(repository.findByTypeOrderByTimestampDesc("ELECTRIC"))
                .thenReturn(Collections.singletonList(rate));

        mockMvc.perform(get("/api/meter-rate/history/ELECTRIC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].type").value("ELECTRIC"))
                .andExpect(jsonPath("$[0].rate").value(2.5));

        verify(repository, times(1)).findByTypeOrderByTimestampDesc("ELECTRIC");
    }

    @Test
    void getLatestForAllTypes_ReturnsListOrNoContent() throws Exception {
        MeterRate rate = new MeterRate();
        rate.setId(1L);
        rate.setType("ELECTRIC");
        rate.setRate(2.5);
        rate.setTimestamp(OffsetDateTime.now());

        // Case 1: list not empty
        when(repository.findLatestRatesForAllTypes()).thenReturn(Collections.singletonList(rate));
        mockMvc.perform(get("/api/meter-rate/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].type").value("ELECTRIC"))
                .andExpect(jsonPath("$[0].rate").value(2.5));

        // Case 2: empty list → noContent
        when(repository.findLatestRatesForAllTypes()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/meter-rate/latest"))
                .andExpect(status().isNoContent());

        verify(repository, times(2)).findLatestRatesForAllTypes();
    }

    @Test
    void getLatestRate_ReturnsRateOrNotFound() throws Exception {
        MeterRate rate = new MeterRate();
        rate.setId(1L);
        rate.setType("ELECTRIC");
        rate.setRate(2.5);
        rate.setTimestamp(OffsetDateTime.now());

        // Case: rate exists
        when(repository.findTopByTypeOrderByTimestampDesc("ELECTRIC")).thenReturn(rate);
        mockMvc.perform(get("/api/meter-rate/latest/ELECTRIC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.type").value("ELECTRIC"))
                .andExpect(jsonPath("$.rate").value(2.5));

        // Case: rate null → notFound
        when(repository.findTopByTypeOrderByTimestampDesc("WATER")).thenReturn(null);
        mockMvc.perform(get("/api/meter-rate/latest/WATER"))
                .andExpect(status().isNotFound());

        verify(repository, times(1)).findTopByTypeOrderByTimestampDesc("ELECTRIC");
        verify(repository, times(1)).findTopByTypeOrderByTimestampDesc("WATER");
    }

    @Test
    void createRate_ReturnsSavedRate() throws Exception {
        MeterRate rate = new MeterRate();
        rate.setType("ELECTRIC");
        rate.setRate(2.5);
        rate.setTimestamp(OffsetDateTime.now());

        MeterRate saved = new MeterRate();
        saved.setId(1L);
        saved.setType("ELECTRIC");
        saved.setRate(2.5);
        saved.setTimestamp(rate.getTimestamp());

        // ใช้ ArgumentMatchers.any() แทน
        when(service.saveRate(any(MeterRate.class))).thenReturn(saved);

        mockMvc.perform(post("/api/meter-rate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.type").value("ELECTRIC"))
                .andExpect(jsonPath("$.rate").value(2.5));

        verify(service, times(1)).saveRate(any(MeterRate.class));
    }
}
