package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.InterestRate;
import com.example.apartmentmanagement.repository.InterestRateRepository;
import com.example.apartmentmanagement.service.InterestRateService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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

class InterestRateControllerTest {

    @Mock
    private InterestRateRepository repository;

    @Mock
    private InterestRateService service;

    @InjectMocks
    private InterestRateController controller;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Test
    void getAllRates_ReturnsList() throws Exception {
        InterestRate rate1 = new InterestRate();
        rate1.setId(1L);
        rate1.setType("SAVINGS");
        rate1.setPercentage(1.5);
        rate1.setTimestamp(OffsetDateTime.now());

        InterestRate rate2 = new InterestRate();
        rate2.setId(2L);
        rate2.setType("LOAN");
        rate2.setPercentage(3.0);
        rate2.setTimestamp(OffsetDateTime.now());

        List<InterestRate> list = Arrays.asList(rate1, rate2);
        when(repository.findAll()).thenReturn(list);

        mockMvc.perform(get("/api/interest-rate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].type").value("SAVINGS"))
                .andExpect(jsonPath("$[0].percentage").value(1.5))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].type").value("LOAN"))
                .andExpect(jsonPath("$[1].percentage").value(3.0));

        verify(repository, times(1)).findAll();
    }

    @Test
    void getHistory_ReturnsListByType() throws Exception {
        InterestRate rate = new InterestRate();
        rate.setId(1L);
        rate.setType("SAVINGS");
        rate.setPercentage(1.5);
        rate.setTimestamp(OffsetDateTime.now());

        when(repository.findByTypeOrderByTimestampDesc("SAVINGS"))
                .thenReturn(Collections.singletonList(rate));

        mockMvc.perform(get("/api/interest-rate/history/SAVINGS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].type").value("SAVINGS"))
                .andExpect(jsonPath("$[0].percentage").value(1.5));

        verify(repository, times(1)).findByTypeOrderByTimestampDesc("SAVINGS");
    }

    @Test
    void getLatestForAllTypes_ReturnsListOrNoContent() throws Exception {
        InterestRate rate = new InterestRate();
        rate.setId(1L);
        rate.setType("SAVINGS");
        rate.setPercentage(1.5);
        rate.setTimestamp(OffsetDateTime.now());

        when(repository.findLatestRatesForAllTypes()).thenReturn(Collections.singletonList(rate));
        mockMvc.perform(get("/api/interest-rate/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].type").value("SAVINGS"))
                .andExpect(jsonPath("$[0].percentage").value(1.5));

        when(repository.findLatestRatesForAllTypes()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/interest-rate/latest"))
                .andExpect(status().isNoContent());

        verify(repository, times(2)).findLatestRatesForAllTypes();
    }

    @Test
    void getLatestRate_ReturnsRateOrNotFound() throws Exception {
        InterestRate rate = new InterestRate();
        rate.setId(1L);
        rate.setType("SAVINGS");
        rate.setPercentage(1.5);
        rate.setTimestamp(OffsetDateTime.now());

        // case: rate exists
        when(repository.findTopByTypeOrderByTimestampDesc("SAVINGS")).thenReturn(rate);
        mockMvc.perform(get("/api/interest-rate/latest/SAVINGS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.type").value("SAVINGS"))
                .andExpect(jsonPath("$.percentage").value(1.5));

        // case: rate null → notFound
        when(repository.findTopByTypeOrderByTimestampDesc("LOAN")).thenReturn(null);
        mockMvc.perform(get("/api/interest-rate/latest/LOAN"))
                .andExpect(status().isNotFound());

        verify(repository, times(1)).findTopByTypeOrderByTimestampDesc("SAVINGS");
        verify(repository, times(1)).findTopByTypeOrderByTimestampDesc("LOAN");
    }

    @Test
    void createRate_ReturnsSavedRate() throws Exception {
        InterestRate rate = new InterestRate();
        rate.setType("SAVINGS");
        rate.setPercentage(1.5);
        rate.setTimestamp(OffsetDateTime.now());

        InterestRate saved = new InterestRate();
        saved.setId(1L);
        saved.setType("SAVINGS");
        saved.setPercentage(1.5);
        saved.setTimestamp(rate.getTimestamp());

        when(service.saveRate(any(InterestRate.class))).thenReturn(saved);

        mockMvc.perform(post("/api/interest-rate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.type").value("SAVINGS"))
                .andExpect(jsonPath("$.percentage").value(1.5));

        when(service.saveRate(any(InterestRate.class))).thenReturn(saved);
    }
}