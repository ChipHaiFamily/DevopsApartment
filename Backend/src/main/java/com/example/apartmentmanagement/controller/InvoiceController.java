package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.dto.InvoiceUpdateDTO;
import com.example.apartmentmanagement.model.Invoice;
import com.example.apartmentmanagement.service.InvoiceService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {
    private final InvoiceService service;
    public InvoiceController(InvoiceService service) { this.service = service; }
    @GetMapping public List<Invoice> getAll() { return service.findAll(); }
    @GetMapping("/{id}") public Optional<Invoice> getById(@PathVariable String id) { return service.findById(id); }
    @PostMapping public Invoice create(@RequestBody Invoice obj) { return service.create(obj); }
    @PutMapping("/{id}")
    public Invoice update(@PathVariable String id, @RequestBody InvoiceUpdateDTO dto) {
        return service.updateFromDto(id, dto);
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable String id) { service.deleteById(id); }
}
