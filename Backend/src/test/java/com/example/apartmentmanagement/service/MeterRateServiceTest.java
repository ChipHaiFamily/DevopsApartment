package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.MeterRate;
import com.example.apartmentmanagement.repository.MeterRateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MeterRateServiceTest {

    @Mock
    private MeterRateRepository repository;

    @InjectMocks
    private MeterRateService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSaveRate() {
        MeterRate rate = new MeterRate();
        rate.setType("electricity");
        rate.setRate(3.5);

        when(repository.save(any(MeterRate.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MeterRate saved = service.saveRate(rate);

        assertNotNull(saved.getTimestamp());
        assertEquals("electricity", saved.getType());
        assertEquals(3.5, saved.getRate());
        assertEquals(ZoneOffset.ofHours(7), saved.getTimestamp().getOffset());

        verify(repository).save(rate);
    }
}
