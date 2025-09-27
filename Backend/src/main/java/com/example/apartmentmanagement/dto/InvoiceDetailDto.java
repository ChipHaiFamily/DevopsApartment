package com.example.apartmentmanagement.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDetailDto {
    private String invoiceId;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private String status;

    private String tenantId;
    private String contractStatus;
    private String roomNum;
    private Integer floor;

    private List<ItemDto> items;
    private List<PaymentDto> payments;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemDto {
        private Long itemId;
        private String description;
        private BigDecimal amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentDto {
        private String paymentId;
        private LocalDate paymentDate;
        private BigDecimal amount;
        private String method;
    }
}
