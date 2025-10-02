package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.*;
import com.example.apartmentmanagement.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ContractServiceTest {

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private IdGenerationService idGenerationService;

    @InjectMocks
    private ContractService contractService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findAll() {
        Contract c1 = new Contract();
        Contract c2 = new Contract();
        when(contractRepository.findAll()).thenReturn(Arrays.asList(c1, c2));

        List<Contract> result = contractService.findAll();

        assertEquals(2, result.size());
        verify(contractRepository, times(1)).findAll();
    }

    @Test
    void findById() {
        Contract c = new Contract();
        c.setContractNum("CTR-2025-001");
        when(contractRepository.findById("CTR-2025-001")).thenReturn(Optional.of(c));

        Optional<Contract> result = contractService.findById("CTR-2025-001");

        assertTrue(result.isPresent());
        assertEquals("CTR-2025-001", result.get().getContractNum());
        verify(contractRepository, times(1)).findById("CTR-2025-001");
    }

    @Test
    void create_withRoom_success() {
        int year = LocalDate.now().getYear();
        String generatedId = String.format("CTR-%d-001", year);

        RoomType roomType = new RoomType();
        roomType.setPrice(BigDecimal.valueOf(1000));

        Room room = new Room();
        room.setRoomNum("R001");
        room.setRoomType(roomType);
        room.setStatus("available");

        Contract contract = new Contract();
        contract.setRoom(room);

        when(idGenerationService.generateContractId()).thenReturn(generatedId);
        when(roomRepository.findById("R001")).thenReturn(Optional.of(room));
        when(contractRepository.existsById(generatedId)).thenReturn(false);
        when(contractRepository.save(any(Contract.class))).thenAnswer(i -> i.getArguments()[0]);

        Contract result = contractService.create(contract);

        assertEquals(generatedId, result.getContractNum());
        assertEquals("active", result.getStatus());
        assertEquals(1000.0, result.getRentAmount());
        assertEquals(2000.0, result.getDeposit());
        assertEquals("occupied", room.getStatus());
        verify(contractRepository, times(1)).save(contract);
    }

    @Test
    void create_withoutRoom_success() {
        int year = LocalDate.now().getYear();
        String generatedId = String.format("CTR-%d-002", year);

        Contract contract = new Contract();

        when(idGenerationService.generateContractId()).thenReturn(generatedId);
        when(contractRepository.existsById(generatedId)).thenReturn(false);
        when(contractRepository.save(any(Contract.class))).thenAnswer(i -> i.getArguments()[0]);

        Contract result = contractService.create(contract);

        assertEquals(generatedId, result.getContractNum());
        assertNull(result.getStatus());
        assertEquals(0.0, result.getRentAmount());
        assertEquals(0.0, result.getDeposit());
        verify(contractRepository, times(1)).save(contract);
    }

    @Test
    void create_roomNotFound_throwsException() {
        int year = LocalDate.now().getYear();
        String generatedId = String.format("CTR-%d-003", year);

        Room room = new Room();
        room.setRoomNum("R999");
        Contract contract = new Contract();
        contract.setRoom(room);

        when(idGenerationService.generateContractId()).thenReturn(generatedId);
        when(roomRepository.findById("R999")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> contractService.create(contract));

        assertEquals("Room not found: R999", exception.getMessage());
    }

    @Test
    void create_existingContract_throwsException() {
        int year = LocalDate.now().getYear();
        String generatedId = String.format("CTR-%d-004", year);

        Contract contract = new Contract();
        contract.setRoom(null);

        when(idGenerationService.generateContractId()).thenReturn(generatedId);
        when(contractRepository.existsById(generatedId)).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> contractService.create(contract));

        assertEquals("Contract with ID " + generatedId + " already exists", exception.getReason());
    }

    @Test
    void save_success() {
        Contract contract = new Contract();
        when(contractRepository.save(contract)).thenReturn(contract);

        Contract result = contractService.save(contract);

        assertEquals(contract, result);
        verify(contractRepository, times(1)).save(contract);
    }

    @Test
    void deleteById_success() {
        doNothing().when(contractRepository).deleteById("CTR-2025-005");

        contractService.deleteById("CTR-2025-005");

        verify(contractRepository, times(1)).deleteById("CTR-2025-005");
    }
}