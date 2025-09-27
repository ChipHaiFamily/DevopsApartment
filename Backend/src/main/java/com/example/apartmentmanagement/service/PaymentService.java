package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.Invoice;
import com.example.apartmentmanagement.model.Payment;
import com.example.apartmentmanagement.repository.InvoiceRepository;
import com.example.apartmentmanagement.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository repository;
    private final InvoiceRepository invoiceRepository;
    private final IdGenerationService idGenerationService;

    public List<Payment> findAll() {
        return repository.findAll();
    }

    public Optional<Payment> findById(String id) {
        return repository.findById(id);
    }

    public Payment save(Payment obj) {
        return repository.save(obj);
    }

    public void deleteById(String id) {
        repository.deleteById(id);
    }
}
