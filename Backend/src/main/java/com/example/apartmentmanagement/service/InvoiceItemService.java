package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.InvoiceItem;
import com.example.apartmentmanagement.repository.InvoiceItemRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class InvoiceItemService {
    private final InvoiceItemRepository repository;
    public InvoiceItemService(InvoiceItemRepository repository) { this.repository = repository; }
    public List<InvoiceItem> findAll() { return repository.findAll(); }
    public Optional<InvoiceItem> findById(Long id) { return repository.findById(id); }
    public InvoiceItem save(InvoiceItem obj) { return repository.save(obj); }
    public void deleteById(Long id) { repository.deleteById(id); }
}
