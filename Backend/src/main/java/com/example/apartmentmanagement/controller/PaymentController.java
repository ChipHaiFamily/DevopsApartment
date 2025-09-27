package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.Payment;
import com.example.apartmentmanagement.service.PaymentService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService service;
    public PaymentController(PaymentService service) { this.service = service; }
    @GetMapping public List<Payment> getAll() { return service.findAll(); }
    @GetMapping("/{id}") public Optional<Payment> getById(@PathVariable String id) { return service.findById(id); }
    @PostMapping public Payment create(@RequestBody Payment obj) { return service.save(obj); }
    @PutMapping("/{id}") public Payment update(@PathVariable String id, @RequestBody Payment obj) { obj.setPaymentId(id); return service.save(obj); }
    @DeleteMapping("/{id}") public void delete(@PathVariable String id) { service.deleteById(id); }
}
