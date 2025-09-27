package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.InvoiceItem;
import com.example.apartmentmanagement.service.InvoiceItemService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/invoice-items")
public class InvoiceItemController {
    private final InvoiceItemService service;
    public InvoiceItemController(InvoiceItemService service) { this.service = service; }
    @GetMapping public List<InvoiceItem> getAll() { return service.findAll(); }
    @GetMapping("/{id}") public Optional<InvoiceItem> getById(@PathVariable Long id) { return service.findById(id); }
    @PostMapping public InvoiceItem create(@RequestBody InvoiceItem obj) { return service.save(obj); }
    @PutMapping("/{id}") public InvoiceItem update(@PathVariable Long id, @RequestBody InvoiceItem obj) { obj.setItemId(id); return service.save(obj); }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { service.deleteById(id); }
}
