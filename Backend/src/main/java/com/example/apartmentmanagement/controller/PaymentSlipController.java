// 📄 PaymentSlipController.java
package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.PaymentSlip;
import com.example.apartmentmanagement.service.PaymentSlipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/payments/slips")
@RequiredArgsConstructor
public class PaymentSlipController {
    private final PaymentSlipService service;

    @PostMapping("/{paymentId}/upload")
    public ResponseEntity<String> uploadSlip(
            @PathVariable String paymentId,
            @RequestParam MultipartFile file) throws IOException {
        service.uploadSlip(paymentId, file);
        return ResponseEntity.ok("Slip uploaded successfully");
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<List<PaymentSlip>> getSlipsByPayment(@PathVariable String paymentId) {
        return ResponseEntity.ok(service.getSlipsByPayment(paymentId));
    }
}
