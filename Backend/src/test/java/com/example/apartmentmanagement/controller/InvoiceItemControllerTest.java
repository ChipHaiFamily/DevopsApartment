package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.InvoiceItem;
import com.example.apartmentmanagement.service.InvoiceItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InvoiceItemControllerTest {

    @Mock
    private InvoiceItemService invoiceItemService;

    @InjectMocks
    private InvoiceItemController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAll_returnsList() {
        InvoiceItem item1 = new InvoiceItem();
        InvoiceItem item2 = new InvoiceItem();
        when(invoiceItemService.findAll()).thenReturn(List.of(item1, item2));

        List<InvoiceItem> result = controller.getAll();

        assertEquals(2, result.size());
        verify(invoiceItemService, times(1)).findAll();
    }

    @Test
    void getById_returnsItem() {
        InvoiceItem item = new InvoiceItem();
        when(invoiceItemService.findById(1L)).thenReturn(Optional.of(item));

        Optional<InvoiceItem> result = controller.getById(1L);

        assertTrue(result.isPresent());
        assertEquals(item, result.get());
        verify(invoiceItemService).findById(1L);
    }

    @Test
    void create_savesItem() {
        InvoiceItem item = new InvoiceItem();
        when(invoiceItemService.save(item)).thenReturn(item);

        InvoiceItem result = controller.create(item);

        assertEquals(item, result);
        verify(invoiceItemService).save(item);
    }

    @Test
    void update_setsIdAndSaves() {
        InvoiceItem item = new InvoiceItem();
        InvoiceItem updatedItem = new InvoiceItem();
        when(invoiceItemService.save(item)).thenReturn(updatedItem);

        InvoiceItem result = controller.update(5L, item);

        assertEquals(updatedItem, result);
        assertEquals(5L, item.getItemId());
        verify(invoiceItemService).save(item);
    }

    @Test
    void delete_callsServiceDelete() {
        controller.delete(10L);
        verify(invoiceItemService).deleteById(10L);
    }
}
