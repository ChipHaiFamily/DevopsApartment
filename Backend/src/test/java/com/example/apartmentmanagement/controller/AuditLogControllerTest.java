package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.AuditLog;
import com.example.apartmentmanagement.service.AuditLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuditLogControllerTest {

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuditLogController auditLogController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(auditLogController).build();
    }

    @Test
    void getLogsByPeriod_ReturnsAuditLogs() throws Exception {
        AuditLog log1 = new AuditLog();
        log1.setId(1L);
        log1.setAction("CREATE");
        log1.setTableName("users");
        log1.setRecordId("R001");
        log1.setActionTime(LocalDateTime.of(2025, 11, 16, 10, 0));

        AuditLog log2 = new AuditLog();
        log2.setId(2L);
        log2.setAction("UPDATE");
        log2.setTableName("users");
        log2.setRecordId("R002");
        log2.setActionTime(LocalDateTime.of(2025, 11, 16, 11, 0));

        List<AuditLog> logs = Arrays.asList(log1, log2);

        when(auditLogService.getByPeriod("2025-11")).thenReturn(logs);

        mockMvc.perform(get("/api/audit")
                        .param("period", "2025-11")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].action").value("CREATE"))
                .andExpect(jsonPath("$[0].tableName").value("users"))
                .andExpect(jsonPath("$[0].recordId").value("R001"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].action").value("UPDATE"))
                .andExpect(jsonPath("$[1].tableName").value("users"))
                .andExpect(jsonPath("$[1].recordId").value("R002"));

        verify(auditLogService, times(1)).getByPeriod("2025-11");
        verifyNoMoreInteractions(auditLogService);
    }
}