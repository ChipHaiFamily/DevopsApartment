package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.PaymentSlip;
import com.example.apartmentmanagement.repository.PaymentSlipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentSlipService {
    private final PaymentSlipRepository repository;

    public PaymentSlip uploadSlip(String paymentId, MultipartFile file) throws IOException {
        List<PaymentSlip> existing = repository.findByPaymentId(paymentId);
        if (!existing.isEmpty()) {
            repository.delete(existing.get(0));
        }

        PaymentSlip slip = PaymentSlip.builder()
                .paymentId(paymentId)
                .slipData(file.getBytes())
                .fileName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .build();
        return repository.save(slip);
    }

    public PaymentSlip getSlipByPayment(String paymentId) {
        List<PaymentSlip> slips = repository.findByPaymentId(paymentId);
        if (slips.isEmpty()) {
            throw new RuntimeException("Slip not found for payment: " + paymentId);
        }
        return slips.get(0); // เอา slip ตัวแรก (ควรมีแค่ 1)
    }

}
