package com.example.apartmentmanagement.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConsumptionDto {
    private String month;
    private BigDecimal water;
    private BigDecimal electric;
    private BigDecimal total;
}
