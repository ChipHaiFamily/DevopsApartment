package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.Supplies;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class SuppliesRepositoryTest {

    @Autowired
    private SuppliesRepository suppliesRepository;

    @Autowired
    private EntityManager entityManager;

    private Supplies sp1;
    private Supplies sp2;

    @BeforeEach
    void setUp() {
        sp1 = Supplies.builder()
                .itemId("SP-001")
                .item_Name("Item A")
                .quantity(10)
                .build();

        sp2 = Supplies.builder()
                .itemId("SP-002")
                .item_Name("Item B")
                .quantity(5)
                .build();

        entityManager.persist(sp1);
        entityManager.persist(sp2);
        entityManager.flush();
    }

    @Test
    @DisplayName("Should find top Supplies by itemId desc")
    void testFindTopByOrderByItemIdDesc() {
        Optional<Supplies> top = suppliesRepository.findTopByOrderByItemIdDesc();
        assertTrue(top.isPresent());
        assertEquals("SP-002", top.get().getItemId());
    }

    @Test
    @DisplayName("Should return empty optional when no Supplies exists")
    void testFindTopByOrderByItemIdDescEmpty() {
        suppliesRepository.deleteAll();
        Optional<Supplies> top = suppliesRepository.findTopByOrderByItemIdDesc();
        assertFalse(top.isPresent());
    }
}
