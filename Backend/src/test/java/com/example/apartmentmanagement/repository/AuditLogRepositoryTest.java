package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.AuditLog;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class AuditLogRepositoryTest {

    @Autowired
    private AuditLogRepository auditLogRepository;

    private AuditLog log1;
    private AuditLog log2;
    private AuditLog log3;

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();

        log1 = new AuditLog();
        log1.setAction("CREATE");
        log1.setActionTime(LocalDateTime.of(2025, 11, 1, 10, 0));

        log2 = new AuditLog();
        log2.setAction("UPDATE");
        log2.setActionTime(LocalDateTime.of(2025, 11, 5, 12, 0));

        log3 = new AuditLog();
        log3.setAction("DELETE");
        log3.setActionTime(LocalDateTime.of(2025, 11, 10, 14, 0));

        auditLogRepository.saveAll(List.of(log1, log2, log3));
    }

    @Test
    void testFindByActionTimeBetween() {
        LocalDateTime start = LocalDateTime.of(2025, 11, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(2025, 11, 6, 0, 0);

        List<AuditLog> result = auditLogRepository.findByActionTimeBetween(start, end);

        assertThat(result).hasSize(2)
                .extracting(AuditLog::getAction)
                .containsExactlyInAnyOrder("CREATE", "UPDATE");
    }
}
