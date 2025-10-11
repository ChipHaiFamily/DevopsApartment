package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class ContractRepositoryIntegrationTest {

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private EntityManager entityManager;

    @BeforeEach
    void setUp() {
        RoomType typeA = RoomType.builder()
                .roomTypeId("RT01")
                .name("Deluxe")
                .description("Standard Room")
                .price(BigDecimal.valueOf(1000))
                .room_image("roomA.jpg")
                .build();
        entityManager.persist(typeA);

        // Create Room
        Room room101 = Room.builder()
                .roomNum("101")
                .roomType(typeA)
                .status("available")
                .build();
        entityManager.persist(room101);

        // Create Tenant
        User user1 = User.builder()
                .id("USR-001")
                .fullName("Full Name")
                .email("user1.c@gmail.com")
                .passwd("pass")
                .build();
        entityManager.persist(user1);

        Tenant tenant1 = Tenant.builder()
                .user(user1)
                .citizenId("1100100123456")
                .emergencyContact("0898765432")
                .emergencyName("Somying Jaidum")
                .emergencyRelationship("Mother")
                .build();
        entityManager.persist(tenant1);

        // Create Contracts
        Contract activeContract = Contract.builder()
                .contractNum("CTR-2025-001")
                .room(room101)
                .tenant(tenant1)
                .status("active")
                .startDate(LocalDate.now().minusDays(10))
                .endDate(LocalDate.now().plusDays(10))
                .build();

        Contract expiredContract = Contract.builder()
                .contractNum("CTR-2025-002")
                .room(room101)
                .tenant(tenant1)
                .status("expired")
                .startDate(LocalDate.of(2023, 1, 1))
                .endDate(LocalDate.of(2023, 12, 31))
                .build();

        entityManager.persist(activeContract);
        entityManager.persist(expiredContract);
        entityManager.flush();
    }

    @Test
    @DisplayName("Should find contract by room number")
    void testFindByRoom_RoomNum() {
        List<Contract> contracts = contractRepository.findByRoom_RoomNum("101");
        assertEquals(2, contracts.size());
        assertEquals("CTR-2025-001", contracts.get(0).getContractNum());
    }

    @Test
    @DisplayName("Should find active contracts by tenant ID")
    void testFindActiveContractsByTenant() {
        List<Contract> activeContracts = contractRepository.findActiveContractsByTenant("USR-001");
        assertEquals(1, activeContracts.size());
        assertEquals("CTR-2025-001", activeContracts.get(0).getContractNum());
    }

    @Test
    @DisplayName("Should find contract by room number and status")
    void testFindByRoomRoomNumAndStatus() {
        Optional<Contract> found = contractRepository.findByRoomRoomNumAndStatus("101", "active");
        assertTrue(found.isPresent());
        assertEquals("CTR-2025-001", found.get().getContractNum());
    }

    @Test
    @DisplayName("Should find latest contract by contractNum desc")
    void testFindTopByOrderByContractNumDesc() {
        Optional<Contract> latest = contractRepository.findTopByOrderByContractNumDesc();
        assertTrue(latest.isPresent());
        assertEquals("CTR-2025-002", latest.get().getContractNum()); // highest ID alphabetically
    }

    @Test
    @DisplayName("Should find contracts by status and date range")
    void testFindByStatusAndDateRange() {
        List<Contract> results = contractRepository.findByStatusAndDateRange(
                "active",
                LocalDate.now().minusDays(15),
                LocalDate.now().plusDays(15)
        );
        assertEquals(1, results.size());
        assertEquals("CTR-2025-001", results.get(0).getContractNum());
    }

    @Test
    @DisplayName("Should count active contracts during date range")
    void testCountActiveContractsDuring() {
        int count = contractRepository.countActiveContractsDuring(
                LocalDate.now().minusDays(15),
                LocalDate.now().plusDays(15)
        );
        assertEquals(1, count);
    }

    @Test
    @DisplayName("Should count active contracts by room type")
    void testCountActiveContractsByRoomType() {
        int deluxeCount = contractRepository.countActiveContractsByRoomType(
                "Deluxe",
                LocalDate.now().minusDays(15),
                LocalDate.now().plusDays(15)
        );
        int suiteCount = contractRepository.countActiveContractsByRoomType(
                "Suite",
                LocalDate.now().minusDays(15),
                LocalDate.now().plusDays(15)
        );

        assertEquals(1, deluxeCount);
        assertEquals(0, suiteCount);
    }
}
