package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.InvoiceDetailDto;
import com.example.apartmentmanagement.dto.InvoiceUpdateDTO;
import com.example.apartmentmanagement.exception.ResourceNotFoundException;
import com.example.apartmentmanagement.model.*;
import com.example.apartmentmanagement.repository.InterestRateRepository;
import com.example.apartmentmanagement.repository.InvoiceRepository;
import com.example.apartmentmanagement.repository.TenantRepository;
import lombok.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final InvoiceRepository repository;
    private final TenantRepository tenantRepository;
    private final InterestRateRepository interestRateRepository;
    private final IdGenerationService idGenerationService;

    public List<Invoice> findAll() { return repository.findAll(); }
    public Optional<Invoice> findById(String id) { return repository.findById(id); }
    public Invoice save(Invoice obj) { return repository.save(obj); }
    public void deleteById(String id) { repository.deleteById(id); }

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
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }


    public Invoice updateFromDto(String id, InvoiceUpdateDTO dto) {
        Invoice invoice = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        invoice.setIssueDate(dto.getIssueDate());
        invoice.setDueDate(dto.getDueDate());

        Tenant tenant = tenantRepository.findById(dto.getTenant().getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
        invoice.setTenant(tenant);

        invoice.setItems(Optional.ofNullable(invoice.getItems()).orElseGet(ArrayList::new));
        invoice.getItems().removeIf(i -> !i.getDescription().toLowerCase().startsWith("interest"));
        for (InvoiceUpdateDTO.ItemDTO itemDto : dto.getItems()) {
            InvoiceItem item = new InvoiceItem();
            item.setItemId(itemDto.getItemId());
            item.setDescription(itemDto.getDescription());
            item.setAmount(itemDto.getAmount());
            item.setInvoice(invoice);
            invoice.getItems().add(item);
        }

        invoice.setPayments(Optional.ofNullable(invoice.getPayments()).orElseGet(ArrayList::new));
        Map<String, Payment> existingPayments = invoice.getPayments().stream()
                .collect(Collectors.toMap(Payment::getPaymentId, p -> p));
        invoice.getPayments().clear();
        for (InvoiceUpdateDTO.PaymentDTO payDto : dto.getPayments()) {
            Payment payment = existingPayments.getOrDefault(payDto.getPaymentId(), new Payment());
            if (payment.getPaymentId() == null) payment.setPaymentId(idGenerationService.generatePaymentId());
            payment.setInvoice(invoice);
            payment.setPaymentDate(LocalDate.parse(payDto.getPaymentDate()));
            payment.setMethod(payDto.getMethod());
            payment.setAmount(payDto.getAmount());
            invoice.getPayments().add(payment);
        }

        BigDecimal totalItems = invoice.getItems().stream()
                .filter(i -> !i.getDescription().toLowerCase().startsWith("interest"))
                .map(InvoiceItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        invoice.setTotalAmount(totalItems);

        BigDecimal totalInterest = applyLateInterest(invoice);

        BigDecimal totalPaid = invoice.getPayments().stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal outstanding = totalItems.add(totalInterest).subtract(totalPaid);

        if (totalPaid.compareTo(BigDecimal.ZERO) == 0) {
            invoice.setStatus("Pending");
        } else if (outstanding.compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus("Paid");
        } else {
            invoice.setStatus("Partial");
        }

        return repository.save(invoice);
    }

    private BigDecimal applyLateInterest(Invoice invoice) {
        LocalDate today = LocalDate.now();
        LocalDate dueDate = invoice.getDueDate();

        if (dueDate == null || !today.isAfter(dueDate)) {
            return BigDecimal.ZERO;
        }

        long monthsLate = java.time.temporal.ChronoUnit.MONTHS.between(
                dueDate.withDayOfMonth(1),
                today.withDayOfMonth(1)
        );

        if (monthsLate <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalPaid = invoice.getPayments().stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalItems = calculateTotalItems(invoice);

        BigDecimal totalInterestBefore = invoice.getItems().stream()
                .filter(i -> i.getDescription().toLowerCase().startsWith("interest"))
                .map(InvoiceItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = totalItems.add(totalInterestBefore).subtract(totalPaid);
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            return totalInterestBefore;
        }

        String rateType = invoice.getStatus().equalsIgnoreCase("Partial") ? "partial" : "unpaid";
        InterestRate rate = interestRateRepository.findTopByTypeOrderByTimestampDesc(rateType);
        if (rate == null) {
            return totalInterestBefore;
        }

        BigDecimal monthlyRate = BigDecimal.valueOf(rate.getPercentage() / 100.0);
        BigDecimal currentOutstanding = remaining;
        long existingInterestCount = invoice.getItems().stream()
                .filter(i -> i.getDescription().toLowerCase().startsWith("interest"))
                .count();

        for (long i = existingInterestCount; i < monthsLate; i++) {
            BigDecimal interestAmount = currentOutstanding
                    .multiply(monthlyRate)
                    .setScale(2, RoundingMode.HALF_UP);

            currentOutstanding = currentOutstanding.add(interestAmount); // ทบต้นเข้าไป

            InvoiceItem interestItem = new InvoiceItem();
            interestItem.setDescription("Interest " + (i + 1));
            interestItem.setAmount(interestAmount);
            interestItem.setInvoice(invoice);
            invoice.getItems().add(interestItem);
        }

        return invoice.getItems().stream()
                .filter(i -> i.getDescription().toLowerCase().startsWith("interest"))
                .map(InvoiceItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public InvoiceDetailDto toInvoiceDetailDto(Invoice invoice) {
        BigDecimal totalItems = calculateTotalItems(invoice);

        BigDecimal totalInterestItems = invoice.getItems().stream()
                .filter(i -> i.getDescription().toLowerCase().startsWith("interest"))
                .map(InvoiceItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPaid = invoice.getPayments().stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal outstanding = totalItems.add(totalInterestItems).subtract(totalPaid);

        invoice.setTotalAmount(totalItems);

        var latestContract = invoice.getTenant().getContract().stream()
                .max(Comparator.comparing(Contract::getStartDate))
                .orElse(null);

        return InvoiceDetailDto.builder()
                .invoiceId(invoice.getInvoiceId())
                .issueDate(invoice.getIssueDate())
                .dueDate(invoice.getDueDate())
                .totalAmount(totalItems)
                .status(invoice.getStatus())
                .tenantId(invoice.getTenant().getTenantId())
                .contractStatus(latestContract != null ? latestContract.getStatus() : null)
                .roomNum(latestContract != null ? latestContract.getRoom().getRoomNum() : null)
                .outstanding(outstanding)
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

    public Invoice create(Invoice obj) {
        obj.setInvoiceId(idGenerationService.generateInvoiceId());
        obj.setStatus("Pending");

        Optional<Invoice> lastInvoiceOpt = repository.findAll().stream()
                .filter(i -> i.getTenant().getTenantId().equals(obj.getTenant().getTenantId()))
                .filter(i -> !"PAID".equalsIgnoreCase(i.getStatus()))
                .max(Comparator.comparing(Invoice::getIssueDate));

        if (lastInvoiceOpt.isPresent()) {
            Invoice lastInvoice = lastInvoiceOpt.get();

            BigDecimal totalItemsOld = lastInvoice.getItems().stream()
                    .map(InvoiceItem::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalPaidOld = lastInvoice.getPayments().stream()
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal outstandingOld = totalItemsOld.subtract(totalPaidOld);

            if (outstandingOld.compareTo(BigDecimal.ZERO) > 0) {
                lastInvoice.setStatus("Carry_forward");
                repository.save(lastInvoice);

                InvoiceItem carryItem = new InvoiceItem();
                carryItem.setDescription("Carry Forward from " + lastInvoice.getInvoiceId());
                carryItem.setAmount(outstandingOld);
                carryItem.setInvoice(obj);
                obj.setItems(Optional.ofNullable(obj.getItems()).orElseGet(ArrayList::new));
                obj.getItems().add(carryItem);

                BigDecimal totalAmount = obj.getItems().stream()
                        .map(InvoiceItem::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                obj.setTotalAmount(totalAmount);
            }
        }

        return repository.save(obj);
    }

    public List<Invoice> getAllInvoices() {
        return repository.findAll();
    }

    public Invoice getInvoiceById(String id) {
        Invoice invoice = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));

        if (!"PAID".equalsIgnoreCase(invoice.getStatus())) {
            BigDecimal interest = applyLateInterest(invoice);

            BigDecimal totalPaid = invoice.getPayments().stream()
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal outstanding = invoice.getTotalAmount().subtract(totalPaid);

            repository.save(invoice);

            System.out.println("Interest added: " + interest);
            System.out.println("Outstanding: " + outstanding);
        }

        return invoice;
    }

    private BigDecimal calculateTotalItems(Invoice invoice) {
        return invoice.getItems().stream()
                .filter(i -> !i.getDescription().toLowerCase().startsWith("interest"))
                .map(InvoiceItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public int countPaidRoomsThisMonth() {
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end = start.plusMonths(1).minusDays(1);

        Set<String> paidRoomNums = repository.findAll().stream()
                .filter(i -> "PAID".equalsIgnoreCase(i.getStatus()))
                .filter(i -> i.getIssueDate() != null &&
                        !i.getIssueDate().isBefore(start) &&
                        !i.getIssueDate().isAfter(end))
                .map(i -> {
                    Contract c = i.getTenant().getContract().stream()
                            .filter(ct -> "active".equalsIgnoreCase(ct.getStatus()))
                            .findFirst()
                            .orElse(null);
                    return c != null && c.getRoom() != null ? c.getRoom().getRoomNum() : null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return paidRoomNums.size();
    }

}
