package com.example.apartmentmanagement.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantsManagement {
    private String tenantId;

    private String name;
    private String gender;
    private String email;
    private String phone;
    private String sex;
    private String job;
    private String workplace;
    private String emergencyContact;
    private String emergencyName;
    private String emergencyRelationship;
    private String currentStatus;
    private List<ContractDto> contracts;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ContractDto {
        private String contractNum;
        private LocalDate startDate;
        private LocalDate endDate;
        private String roomNumber;
        private double rentAmount;
        private double deposit;
        private String billingCycle;
        private String status;
    }
}
