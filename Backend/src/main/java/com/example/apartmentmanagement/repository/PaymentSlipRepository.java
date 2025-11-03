package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.PaymentSlip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentSlipRepository extends JpaRepository<PaymentSlip, Long> {
    List<PaymentSlip> findByPaymentId(String paymentId);

    Optional<PaymentSlip> findTopByPaymentIdOrderByUploadedAtDesc(String paymentId);
}
