package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.dto.InvoiceUpdateDTO;
import com.example.apartmentmanagement.model.Invoice;
import com.example.apartmentmanagement.service.InvoiceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InvoiceControllerTest {

    @Mock
    private InvoiceService invoiceService;

    @InjectMocks
    private InvoiceController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAll_returnsList() {
        Invoice i1 = new Invoice();
        Invoice i2 = new Invoice();
        when(invoiceService.findAll()).thenReturn(List.of(i1, i2));

        List<Invoice> result = controller.getAll();

        assertEquals(2, result.size());
        verify(invoiceService, times(1)).findAll();
    }

    @Test
    void getById_returnsInvoice() {
        Invoice invoice = new Invoice();
        when(invoiceService.findById("INV-001")).thenReturn(Optional.of(invoice));

        Optional<Invoice> result = controller.getById("INV-001");

        assertTrue(result.isPresent());
        assertEquals(invoice, result.get());
        verify(invoiceService).findById("INV-001");
    }

    @Test
    void create_savesInvoice() {
        Invoice invoice = new Invoice();
        when(invoiceService.create(invoice)).thenReturn(invoice);

        Invoice result = controller.create(invoice);

        assertEquals(invoice, result);
        verify(invoiceService).create(invoice);
    }

    @Test
    void update_callsServiceUpdateFromDto() {
        InvoiceUpdateDTO dto = new InvoiceUpdateDTO();
        Invoice updatedInvoice = new Invoice();
        when(invoiceService.updateFromDto("INV-002", dto)).thenReturn(updatedInvoice);

        Invoice result = controller.update("INV-002", dto);

        assertEquals(updatedInvoice, result);
        verify(invoiceService).updateFromDto("INV-002", dto);
    }

    @Test
    void delete_callsServiceDelete() {
        controller.delete("INV-003");
        verify(invoiceService).deleteById("INV-003");
    }
}
