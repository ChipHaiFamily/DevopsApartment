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
class ContractRepositoryTest {

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private EntityManager entityManager;

    private RoomType typeA;
    private Room room101;
    private User user1;
    private Tenant tenant1;
    private Contract activeContract;
    private Contract expiredContract;

    @BeforeEach
    void setUp() {
        typeA = new RoomType();
        typeA.setRoomTypeId("RT01");
        typeA.setName("Deluxe");
        typeA.setDescription("Standard Room");
        typeA.setPrice(BigDecimal.valueOf(1000));
        typeA.setRoom_image("roomA.jpg");
        entityManager.persist(typeA);

        room101 = new Room();
        room101.setRoomNum("101");
        room101.setRoomType(typeA);
        room101.setStatus("available");
        entityManager.persist(room101);

        user1 = new User();
        user1.setId("USR-001");
        user1.setFullName("Full Name");
        user1.setEmail("user1.c@gmail.com");
        user1.setPasswd("pass");
        entityManager.persist(user1);

        tenant1 = new Tenant();
        tenant1.setUser(user1);
        tenant1.setCitizenId("1100100123456");
        tenant1.setEmergencyContact("0898765432");
        tenant1.setEmergencyName("Somying Jaidum");
        tenant1.setEmergencyRelationship("Mother");
        entityManager.persist(tenant1);

        activeContract = new Contract();
        activeContract.setContractNum("CTR-2025-001");
        activeContract.setRoom(room101);
        activeContract.setTenant(tenant1);
        activeContract.setStatus("active");
        activeContract.setStartDate(LocalDate.now().minusDays(10));
        activeContract.setEndDate(LocalDate.now().plusDays(10));
        entityManager.persist(activeContract);

        expiredContract = new Contract();
        expiredContract.setContractNum("CTR-2025-002");
        expiredContract.setRoom(room101);
        expiredContract.setTenant(tenant1);
        expiredContract.setStatus("expired");
        expiredContract.setStartDate(LocalDate.of(2023, 1, 1));
        expiredContract.setEndDate(LocalDate.of(2023, 12, 31));
        entityManager.persist(expiredContract);

        entityManager.flush();
    }

    @Test
    @DisplayName("Should find contract by room number")
    void testFindByRoom_RoomNum() {
        List<Contract> contracts = contractRepository.findByRoom_RoomNum("101");
        assertEquals(2, contracts.size());
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
    @DisplayName("Should find top contract by contractNum desc")
    void testFindTopByOrderByContractNumDesc() {
        Optional<Contract> latest = contractRepository.findTopByOrderByContractNumDesc();
        assertTrue(latest.isPresent());
        assertEquals("CTR-2025-002", latest.get().getContractNum());
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

    @Test
    @DisplayName("Should return empty list if no contracts match status and date range")
    void testFindByStatusAndDateRangeNoMatch() {
        List<Contract> results = contractRepository.findByStatusAndDateRange(
                "active",
                LocalDate.of(2020, 1, 1),
                LocalDate.of(2020, 12, 31)
        );
        assertTrue(results.isEmpty());
    }

    @Test
    @DisplayName("Should return 0 count if no active contracts during date range")
    void testCountActiveContractsDuringNoMatch() {
        int count = contractRepository.countActiveContractsDuring(
                LocalDate.of(2020, 1, 1),
                LocalDate.of(2020, 12, 31)
        );
        assertEquals(0, count);
    }
}