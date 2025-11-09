package com.example.apartmentmanagement.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDashboardDto {
    private String paymentId;
    private String invoiceId;
    private String roomNum;
    private String tenantName;
    private LocalDate paymentDate;
    private String method;
    private BigDecimal amount;
    private String slipBase64;
}
