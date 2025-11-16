package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.InterestRate;
import com.example.apartmentmanagement.repository.InterestRateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InterestRateServiceTest {

    @Mock
    private InterestRateRepository repository;

    @InjectMocks
    private InterestRateService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSaveRate() {
        InterestRate rate = new InterestRate();
        rate.setPercentage(5.0);

        when(repository.save(any(InterestRate.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InterestRate saved = service.saveRate(rate);

        assertNotNull(saved.getTimestamp());
        assertEquals(5.0, saved.getPercentage());
        assertEquals(ZoneOffset.ofHours(7), saved.getTimestamp().getOffset());

        verify(repository).save(rate);
    }
}