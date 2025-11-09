package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.PaymentSlip;
import com.example.apartmentmanagement.service.PaymentSlipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

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

    @GetMapping("/{paymentId}/view")
    public ResponseEntity<byte[]> viewSlip(@PathVariable String paymentId) {
        PaymentSlip slip = service.getSlipByPayment(paymentId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(slip.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + slip.getFileName() + "\"")
                .body(slip.getSlipData());
    }

    @GetMapping("/{paymentId}/download")
    public ResponseEntity<byte[]> downloadSlip(@PathVariable String paymentId) {
        PaymentSlip slip = service.getSlipByPayment(paymentId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(slip.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + slip.getFileName() + "\"")
                .body(slip.getSlipData());
    }

    @PutMapping("/{paymentId}/update")
    public ResponseEntity<PaymentSlip> updateSlip(
            @PathVariable String paymentId,
            @RequestParam MultipartFile file) throws IOException {
        PaymentSlip updated = service.updateSlip(paymentId, file);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{paymentId}/delete")
    public ResponseEntity<String> deleteSlip(@PathVariable String paymentId) {
        service.deleteSlip(paymentId);
        return ResponseEntity.ok("Slip deleted successfully");
    }
}
