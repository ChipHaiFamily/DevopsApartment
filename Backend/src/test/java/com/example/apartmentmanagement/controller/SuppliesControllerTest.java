package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.Supplies;
import com.example.apartmentmanagement.service.SuppliesService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SuppliesControllerTest {

    @Mock
    private SuppliesService service;

    @InjectMocks
    private SuppliesController controller;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAll_returnsListOfSupplies() {
        Supplies s1 = Supplies.builder().itemId("A01").item_Name("Broom").build();
        Supplies s2 = Supplies.builder().itemId("A02").item_Name("Mop").build();

        when(service.findAll()).thenReturn(List.of(s1, s2));

        List<Supplies> result = controller.getAll();

        assertEquals(2, result.size());
        verify(service).findAll();
    }

    @Test
    void getById_returnsSupply() {
        Supplies s = Supplies.builder().itemId("A01").item_Name("Broom").build();
        when(service.findById("A01")).thenReturn(Optional.of(s));

        Optional<Supplies> result = controller.getById("A01");

        assertTrue(result.isPresent());
        assertEquals("A01", result.get().getItemId());
        verify(service).findById("A01");
    }

    @Test
    void create_returnsSavedSupply() {
        Supplies input = Supplies.builder().itemId("A03").item_Name("Bucket").build();
        Supplies saved = Supplies.builder().itemId("A03").item_Name("Bucket").build();

        when(service.save(input)).thenReturn(saved);

        Supplies result = controller.create(input);

        assertEquals("A03", result.getItemId());
        verify(service).save(input);
    }

    @Test
    void update_setsIdAndReturnsSavedSupply() {
        Supplies input = Supplies.builder().item_Name("Updated Name").build();
        Supplies saved = Supplies.builder().itemId("A01").item_Name("Updated Name").build();

        when(service.save(any(Supplies.class))).thenReturn(saved);

        Supplies result = controller.update("A01", input);

        assertEquals("A01", result.getItemId());
        assertEquals("Updated Name", result.getItem_Name());
        verify(service).save(input);
    }

    @Test
    void delete_callsServiceDeleteById() {
        doNothing().when(service).deleteById("A01");

        controller.delete("A01");

        verify(service).deleteById("A01");
    }
}
