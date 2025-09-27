package com.example.apartmentmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceUpdateDTO {
    private String invoiceId;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private String status;
    private TenantDTO tenant;
    private List<ItemDTO> items;
    private List<PaymentDTO> payments;

    @Data
    public static class TenantDTO {
        private String tenantId;
    }
    @Data
    public static class ItemDTO {
        private Long itemId;
        private String description;
        private BigDecimal amount;
    }

    @Data
    public static class PaymentDTO {
        private String paymentId;
        private String paymentDate;
        private String method;
        private BigDecimal amount;
    }
}
