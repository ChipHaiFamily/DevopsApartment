// 📄 PaymentSlipService.java
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
        PaymentSlip slip = PaymentSlip.builder()
                .paymentId(paymentId)
                .slipData(file.getBytes())
                .fileName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .build();
        return repository.save(slip);
    }

    public List<PaymentSlip> getSlipsByPayment(String paymentId) {
        return repository.findByPaymentId(paymentId);
    }
}
