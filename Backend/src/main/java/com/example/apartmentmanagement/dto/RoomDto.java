package com.example.apartmentmanagement.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDto {
    private String roomNum;
    private int floor;
    private String status;
    private String roomTypeName;
    private BigDecimal price;
    private String tenantName;
}


