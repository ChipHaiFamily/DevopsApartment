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

    public void uploadSlip(String paymentId, MultipartFile file) throws IOException {
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
        repository.save(slip);
    }

    public PaymentSlip getSlipByPayment(String paymentId) {
        List<PaymentSlip> slips = repository.findByPaymentId(paymentId);
        if (slips.isEmpty()) {
            throw new RuntimeException("Slip not found for payment: " + paymentId);
        }
        return slips.get(0); // เอา slip ตัวแรก (ควรมีแค่ 1)
    }

    public PaymentSlip updateSlip(String paymentId, MultipartFile file) throws IOException {
        PaymentSlip existing = getSlipByPayment(paymentId);

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File must not be empty");
        }

        existing.setSlipData(file.getBytes());
        existing.setFileName(file.getOriginalFilename());
        existing.setMimeType(file.getContentType());

        return repository.save(existing);
    }
    public void deleteSlip(String paymentId) {
        List<PaymentSlip> slips = repository.findByPaymentId(paymentId);
        if (slips.isEmpty()) {
            throw new RuntimeException("No slip found for payment: " + paymentId);
        }
        repository.delete(slips.get(0));
    }
}
