package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.InvoiceDetailDto;
import com.example.apartmentmanagement.dto.InvoiceUpdateDTO;
import com.example.apartmentmanagement.exception.ResourceNotFoundException;
import com.example.apartmentmanagement.model.*;
import com.example.apartmentmanagement.repository.InvoiceRepository;
import com.example.apartmentmanagement.repository.TenantRepository;
import lombok.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final InvoiceRepository repository;
    private final TenantRepository tenantRepository;
    private final IdGenerationService idGenerationService;

    public List<Invoice> findAll() { return repository.findAll(); }
    public Optional<Invoice> findById(String id) { return repository.findById(id); }
    public Invoice save(Invoice obj) { return repository.save(obj); }
    public void deleteById(String id) { repository.deleteById(id); }

    public Invoice create(Invoice obj) {
        obj.setInvoiceId(idGenerationService.generateInvoiceId());
        obj.setStatus("Pending");
        return repository.save(obj);
    }

    public int countOutstandingInvoices() {
        return (int) repository.findAll().stream()
                .filter(i -> !"PAID".equalsIgnoreCase(i.getStatus()))
                .count();
    }

    public List<Invoice> getOutstandingInvoices() {
        return repository.findAll().stream()
                .filter(i -> !"PAID".equalsIgnoreCase(i.getStatus()))
                .toList();
    }

    public BigDecimal getRevenueThisMonth() {
        return repository.findAll().stream()
                .filter(i -> i.getIssueDate().getMonth() == java.time.LocalDate.now().getMonth())
                .filter(i -> "PAID".equalsIgnoreCase(i.getStatus()))
                .map(Invoice::getTotalAmount) // ใช้ totalAmount
                .reduce(BigDecimal.ZERO, BigDecimal::add); // ใช้ BigDecimal.add
    }

    public Invoice updateFromDto(String id, InvoiceUpdateDTO dto) {
        Invoice invoice = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        invoice.setIssueDate(dto.getIssueDate());
        invoice.setDueDate(dto.getDueDate());
        invoice.setTotalAmount(dto.getTotalAmount());

        Tenant tenant = tenantRepository.findById(dto.getTenant().getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
        invoice.setTenant(tenant);

        // --- Items ---
        invoice.getItems().clear();
        for (InvoiceUpdateDTO.ItemDTO itemDto : dto.getItems()) {
            InvoiceItem item = new InvoiceItem();
            item.setItemId(itemDto.getItemId());
            item.setDescription(itemDto.getDescription());
            item.setAmount(itemDto.getAmount());
            item.setInvoice(invoice);
            invoice.getItems().add(item);
        }

        // --- Payments ---
        Map<String, Payment> existingPayments = invoice.getPayments().stream()
                .collect(Collectors.toMap(Payment::getPaymentId, p -> p));

        invoice.getPayments().clear();
        for (InvoiceUpdateDTO.PaymentDTO payDto : dto.getPayments()) {
            Payment payment;
            if (payDto.getPaymentId() != null && existingPayments.containsKey(payDto.getPaymentId())) {
                payment = existingPayments.get(payDto.getPaymentId());
            } else {
                payment = new Payment();
                payment.setPaymentId(idGenerationService.generatePaymentId());
            }

            payment.setInvoice(invoice);
            payment.setPaymentDate(LocalDate.parse(payDto.getPaymentDate()));
            payment.setMethod(payDto.getMethod());
            payment.setAmount(payDto.getAmount());

            invoice.getPayments().add(payment);
        }

        // --- Update Invoice Status ---
        BigDecimal totalPaid = invoice.getPayments().stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPaid.compareTo(BigDecimal.ZERO) == 0) {
            invoice.setStatus("Pending");
        } else if (totalPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus("Paid");
        } else {
            invoice.setStatus("Partial");
        }

        return repository.save(invoice); // cascade save items + payments
    }

    public InvoiceDetailDto toInvoiceDetailDto(Invoice invoice) {
        var latestContract = invoice.getTenant().getContract().stream()
                .max(Comparator.comparing(Contract::getStartDate))
                .orElse(null);

        return InvoiceDetailDto.builder()
                .invoiceId(invoice.getInvoiceId())
                .issueDate(invoice.getIssueDate())
                .dueDate(invoice.getDueDate())
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .tenantId(invoice.getTenant().getTenantId())
                .contractStatus(latestContract != null ? latestContract.getStatus() : null)
                .roomNum(latestContract != null ? latestContract.getRoom().getRoomNum() : null)
                .floor(latestContract != null ? latestContract.getRoom().getFloor() : null)
                .items(invoice.getItems().stream()
                        .map(i -> InvoiceDetailDto.ItemDto.builder()
                                .itemId(i.getItemId())
                                .description(i.getDescription())
                                .amount(i.getAmount())
                                .build())
                        .toList())
                .payments(invoice.getPayments().stream()
                        .map(p -> InvoiceDetailDto.PaymentDto.builder()
                                .paymentId(p.getPaymentId())
                                .paymentDate(p.getPaymentDate())
                                .amount(p.getAmount())
                                .method(p.getMethod())
                                .build())
                        .toList())
                .build();
    }

    public List<Invoice> getAllInvoices() {
        return repository.findAll();
    }

    public Invoice getInvoiceById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
    }
}
