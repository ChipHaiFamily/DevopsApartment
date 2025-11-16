package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.Supplies;
import com.example.apartmentmanagement.repository.SuppliesRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SuppliesServiceTest {

    @Mock
    private SuppliesRepository repository;

    @Mock
    private IdGenerationService idGenService;

    @InjectMocks
    private SuppliesService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void save_newItem_setsIdAndStatusInStock() {
        Supplies supply = new Supplies();
        supply.setQuantity(20);
        supply.setItemId(null);

        when(idGenService.generateSupplyId()).thenReturn("S001");
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Supplies saved = service.save(supply);

        assertEquals("S001", saved.getItemId());
        assertEquals("in stock", saved.getStatus());
    }

    @Test
    void save_quantityZero_setsStatusOutOfStock() {
        Supplies supply = new Supplies();
        supply.setQuantity(0);
        supply.setItemId("S002");

        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Supplies saved = service.save(supply);

        assertEquals("out of stock", saved.getStatus());
    }

    @Test
    void save_quantityLow_setsStatusLowStock() {
        Supplies supply = new Supplies();
        supply.setQuantity(5);
        supply.setItemId("S003");

        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Supplies saved = service.save(supply);

        assertEquals("low stock", saved.getStatus());
    }

    @Test
    void findAll_returnsAllSupplies() {
        Supplies s1 = new Supplies();
        Supplies s2 = new Supplies();
        when(repository.findAll()).thenReturn(List.of(s1, s2));

        List<Supplies> result = service.findAll();

        assertEquals(2, result.size());
    }

    @Test
    void findById_returnsOptional() {
        Supplies s = new Supplies();
        when(repository.findById("S001")).thenReturn(Optional.of(s));

        Optional<Supplies> result = service.findById("S001");

        assertTrue(result.isPresent());
        assertEquals(s, result.get());
    }

    @Test
    void deleteById_invokesRepository() {
        service.deleteById("S001");
        verify(repository).deleteById("S001");
    }
}
