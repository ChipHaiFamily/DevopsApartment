package com.example.apartmentmanagement.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomOutstandingDto {
    private String roomNum;
    private BigDecimal totalOutstanding;
    private List<PaymentStatusDto> payments;
}
