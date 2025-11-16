package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.Supplies;
import com.example.apartmentmanagement.model.SuppliesHistory;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class SuppliesHistoryRepositoryTest {

    @Autowired
    private SuppliesHistoryRepository suppliesHistoryRepository;

    @Autowired
    private EntityManager entityManager;

    private SuppliesHistory history1;
    private SuppliesHistory history2;

    @BeforeEach
    void setUp() {
        Supplies sp1 = new Supplies();
        sp1.setItemId("SP-001");
        sp1.setItem_Name("Item A");
        entityManager.persist(sp1);

        Supplies sp2 = new Supplies();
        sp2.setItemId("SP-002");
        sp2.setItem_Name("Item B");
        entityManager.persist(sp2);

        // สร้าง SuppliesHistory
        history1 = SuppliesHistory.builder()
                .historyId("SH-001")
                .itemId(sp1)  // <-- ใส่ entity จริง
                .action("added")
                .quantity(10)
                .date(LocalDate.now().minusDays(2))
                .build();

        history2 = SuppliesHistory.builder()
                .historyId("SH-002")
                .itemId(sp2)  // <-- ใส่ entity จริง
                .action("removed")
                .quantity(5)
                .date(LocalDate.now().minusDays(1))
                .build();

        entityManager.persist(history1);
        entityManager.persist(history2);
        entityManager.flush();
    }

    @Test
    @DisplayName("Should find top SuppliesHistory by historyId desc")
    void testFindTopByOrderByHistoryIdDesc() {
        Optional<SuppliesHistory> top = suppliesHistoryRepository.findTopByOrderByHistoryIdDesc();
        assertTrue(top.isPresent());
        assertEquals("SH-002", top.get().getHistoryId());
    }

    @Test
    @DisplayName("Should return empty optional when no SuppliesHistory exists")
    void testFindTopByOrderByHistoryIdDescEmpty() {
        suppliesHistoryRepository.deleteAll();
        Optional<SuppliesHistory> top = suppliesHistoryRepository.findTopByOrderByHistoryIdDesc();
        assertFalse(top.isPresent());
    }
}
