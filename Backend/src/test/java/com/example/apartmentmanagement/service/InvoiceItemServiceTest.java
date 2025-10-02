package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.InvoiceItem;
import com.example.apartmentmanagement.repository.InvoiceItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InvoiceItemServiceTest {

    @Mock
    private InvoiceItemRepository repository;

    @InjectMocks
    private InvoiceItemService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findAll_success() {
        InvoiceItem item1 = new InvoiceItem();
        InvoiceItem item2 = new InvoiceItem();
        when(repository.findAll()).thenReturn(Arrays.asList(item1, item2));

        List<InvoiceItem> result = service.findAll();

        assertEquals(2, result.size());
        verify(repository, times(1)).findAll();
    }

    @Test
    void findById_found() {
        InvoiceItem item = new InvoiceItem();
        item.setItemId(1L);
        when(repository.findById(1L)).thenReturn(Optional.of(item));

        Optional<InvoiceItem> result = service.findById(1L);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getItemId());
        verify(repository, times(1)).findById(1L);
    }

    @Test
    void findById_notFound() {
        when(repository.findById(2L)).thenReturn(Optional.empty());

        Optional<InvoiceItem> result = service.findById(2L);

        assertFalse(result.isPresent());
        verify(repository, times(1)).findById(2L);
    }

    @Test
    void save_success() {
        InvoiceItem item = new InvoiceItem();
        when(repository.save(item)).thenReturn(item);

        InvoiceItem result = service.save(item);

        assertEquals(item, result);
        verify(repository, times(1)).save(item);
    }

    @Test
    void deleteById_success() {
        doNothing().when(repository).deleteById(1L);

        service.deleteById(1L);

        verify(repository, times(1)).deleteById(1L);
    }
}
