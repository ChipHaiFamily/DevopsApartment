package com.example.apartmentmanagement.controller;
import com.example.apartmentmanagement.model.Contract;
import com.example.apartmentmanagement.service.ContractService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ContractControllerTest {

    @Mock
    private ContractService contractService;

    @InjectMocks
    private ContractController contractController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAll_returnsAllContracts() {
        Contract c1 = new Contract(); c1.setContractNum("C001");
        Contract c2 = new Contract(); c2.setContractNum("C002");
        when(contractService.findAll()).thenReturn(List.of(c1, c2));

        List<Contract> result = contractController.getAll();
        assertEquals(2, result.size());
        assertEquals("C001", result.get(0).getContractNum());
        assertEquals("C002", result.get(1).getContractNum());
    }

    @Test
    void getById_returnsContract() {
        Contract c = new Contract(); c.setContractNum("C100");
        when(contractService.findById("C100")).thenReturn(Optional.of(c));

        Optional<Contract> result = contractController.getById("C100");
        assertTrue(result.isPresent());
        assertEquals("C100", result.get().getContractNum());
    }

    @Test
    void create_savesContract() {
        Contract input = new Contract(); input.setContractNum("C200");
        when(contractService.create(input)).thenReturn(input);

        Contract result = contractController.create(input);
        assertEquals("C200", result.getContractNum());
        verify(contractService, times(1)).create(input);
    }

    @Test
    void update_setsIdAndSaves() {
        Contract input = new Contract(); input.setContractNum("TEMP"); // id will be overridden
        when(contractService.save(input)).thenReturn(input);

        Contract result = contractController.update("C300", input);
        assertEquals("C300", input.getContractNum());
        assertEquals("C300", result.getContractNum());
        verify(contractService, times(1)).save(input);
    }

    @Test
    void delete_callsService() {
        doNothing().when(contractService).deleteById("C400");

        contractController.delete("C400");

        verify(contractService, times(1)).deleteById("C400");
    }
}
