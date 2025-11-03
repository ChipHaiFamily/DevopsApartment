package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.PaymentDashboardDto;
import com.example.apartmentmanagement.model.Invoice;
import com.example.apartmentmanagement.model.Payment;
import com.example.apartmentmanagement.model.PaymentSlip;
import com.example.apartmentmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository repository;
    private final ContractRepository contractRepo;
    private final PaymentSlipRepository slipRepository;

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


    public List<PaymentDashboardDto> getAllPayments() {
        return repository.findAllByOrderByPaymentDateDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public PaymentDashboardDto getPaymentById(String paymentId) {
        Payment payment = repository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id " + paymentId));
        return toDto(payment);
    }

    private PaymentDashboardDto toDto(Payment payment) {
        Optional<PaymentSlip> slipOpt = slipRepository.findTopByPaymentIdOrderByUploadedAtDesc(payment.getPaymentId());

        String base64Slip = slipOpt.map(slip ->
                "data:" + slip.getMimeType() + ";base64," +
                        Base64.getEncoder().encodeToString(slip.getSlipData())
        ).orElse(null);

        var invoice = payment.getInvoice();
        String roomNum = contractRepo.findActiveContractsByTenant(invoice.getTenant().getTenantId()).stream()
                .findFirst()
                .map(contract -> contract.getRoom().getRoomNum())
                .orElse("N/A");
        var tenantName = invoice.getTenant().getUser().getFullName();

        return PaymentDashboardDto.builder()
                .paymentId(payment.getPaymentId())
                .invoiceId(invoice != null ? invoice.getInvoiceId() : null)
                .roomNum(roomNum)
                .tenantName(tenantName)
                .paymentDate(payment.getPaymentDate())
                .method(payment.getMethod())
                .amount(payment.getAmount())
                .slipBase64(base64Slip)
                .build();
    }
}
