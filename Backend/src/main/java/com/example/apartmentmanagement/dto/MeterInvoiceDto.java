package com.example.apartmentmanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class MeterInvoiceDto {
    private String room;
    private BigDecimal roomPrice;
    private List<MeterDetail> latestMeters;

    @Data
    @Builder
    public static class MeterDetail {
        private String meterId;
        private String room;
        private String period;
        private String type;
        private int unit;
        private BigDecimal totalBill;
        private LocalDate recordDate;
    }
}
