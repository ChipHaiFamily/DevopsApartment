package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.Supplies;
import com.example.apartmentmanagement.model.SuppliesHistory;
import com.example.apartmentmanagement.repository.SuppliesHistoryRepository;
import com.example.apartmentmanagement.repository.SuppliesRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SuppliesHistoryServiceTest {

    @Mock
    private SuppliesHistoryRepository historyRepository;

    @Mock
    private SuppliesRepository suppliesRepository;

    @Mock
    private IdGenerationService idGenService;

    @InjectMocks
    private SuppliesHistoryService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSave_UseAction_DecreasesQuantity() {
        Supplies supply = new Supplies();
        supply.setItemId("S001");
        supply.setQuantity(20);
        supply.setStatus("In Stock");

        SuppliesHistory history = new SuppliesHistory();
        history.setAction("use");
        history.setQuantity(5);
        history.setItemId(supply);

        when(idGenService.generateSupplyHistoryId()).thenReturn("H001");
        when(suppliesRepository.findById("S001")).thenReturn(Optional.of(supply));
        when(historyRepository.save(any(SuppliesHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(suppliesRepository.save(any(Supplies.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SuppliesHistory saved = service.save(history);

        assertEquals("H001", saved.getHistoryId());
        assertEquals(15, supply.getQuantity());
        assertEquals("In Stock", supply.getStatus());
        verify(suppliesRepository).save(supply);
        verify(historyRepository).save(history);
    }

    @Test
    void testSave_WithdrawAction_LowStock() {
        Supplies supply = new Supplies();
        supply.setItemId("S002");
        supply.setQuantity(12);

        SuppliesHistory history = new SuppliesHistory();
        history.setAction("withdraw");
        history.setQuantity(5);
        history.setItemId(supply);

        when(idGenService.generateSupplyHistoryId()).thenReturn("H002");
        when(suppliesRepository.findById("S002")).thenReturn(Optional.of(supply));
        when(historyRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(suppliesRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        SuppliesHistory saved = service.save(history);

        assertEquals(7, supply.getQuantity());
        assertEquals("Low Stock", supply.getStatus());
    }

    @Test
    void testSave_AddAction_IncreasesQuantity() {
        Supplies supply = new Supplies();
        supply.setItemId("S003");
        supply.setQuantity(5);

        SuppliesHistory history = new SuppliesHistory();
        history.setAction("add");
        history.setQuantity(10);
        history.setItemId(supply);

        when(idGenService.generateSupplyHistoryId()).thenReturn("H003");
        when(suppliesRepository.findById("S003")).thenReturn(Optional.of(supply));
        when(historyRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(suppliesRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        SuppliesHistory saved = service.save(history);

        assertEquals(15, supply.getQuantity());
        assertEquals("In Stock", supply.getStatus());
    }

    @Test
    void testSave_UnknownAction_Throws() {
        Supplies supply = new Supplies();
        supply.setItemId("S004");

        SuppliesHistory history = new SuppliesHistory();
        history.setAction("invalid");
        history.setQuantity(1);
        history.setItemId(supply);

        when(idGenService.generateSupplyHistoryId()).thenReturn("H004");
        when(suppliesRepository.findById("S004")).thenReturn(Optional.of(supply));

        assertThrows(IllegalArgumentException.class, () -> service.save(history));
    }

    @Test
    void testFindAll() {
        SuppliesHistory h1 = new SuppliesHistory();
        SuppliesHistory h2 = new SuppliesHistory();
        when(historyRepository.findAll()).thenReturn(List.of(h1, h2));

        List<SuppliesHistory> result = service.findAll();

        assertEquals(2, result.size());
    }

    @Test
    void testFindById() {
        SuppliesHistory h = new SuppliesHistory();
        when(historyRepository.findById("H001")).thenReturn(Optional.of(h));

        Optional<SuppliesHistory> result = service.findById("H001");

        assertTrue(result.isPresent());
        assertEquals(h, result.get());
    }

    @Test
    void testDeleteById() {
        service.deleteById("H001");
        verify(historyRepository).deleteById("H001");
    }

    @Test
    void testGetItemIdValue_whenItemIdIsSet() {
        Supplies supplies = new Supplies();
        supplies.setItemId("SUP-001");

        SuppliesHistory history = new SuppliesHistory();
        history.setItemId(supplies);

        assertEquals("SUP-001", history.getItemIdValue());
    }

    @Test
    void testGetItemIdValue_whenItemIdIsNull() {
        SuppliesHistory history = new SuppliesHistory();
        history.setItemId(null);

        assertNull(history.getItemIdValue());
    }

    @Test
    void testSetItemIdByString_withValidString() {
        SuppliesHistory history = new SuppliesHistory();
        history.setItemIdByString("SUP-002");

        assertNotNull(history.getItemId());
        assertEquals("SUP-002", history.getItemId().getItemId());
    }

    @Test
    void testSetItemIdByString_withNull() {
        SuppliesHistory history = new SuppliesHistory();
        history.setItemIdByString(null);

        assertNull(history.getItemId());
    }

    @Test
    void testBuilderAndOtherFields() {
        Supplies supplies = new Supplies();
        supplies.setItemId("SUP-003");

        SuppliesHistory history = SuppliesHistory.builder()
                .historyId("HIS-001")
                .itemId(supplies)
                .item_Name("Paper")
                .quantity(10)
                .date(LocalDate.of(2025, 11, 16))
                .operator("John")
                .action("Add")
                .build();

        assertEquals("HIS-001", history.getHistoryId());
        assertEquals("SUP-003", history.getItemIdValue());
        assertEquals("Paper", history.getItem_Name());
        assertEquals(10, history.getQuantity());
        assertEquals(LocalDate.of(2025, 11, 16), history.getDate());
        assertEquals("John", history.getOperator());
        assertEquals("Add", history.getAction());
    }

}