package com.example.apartmentmanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract {
    @Id
    @Column(length = 20)
    private String contractNum;

    private LocalDate startDate;
    private LocalDate endDate;
    private double rentAmount;
    private double deposit;
    private String billingCycle;
    private String status;

    @PrePersist
    public void prePersist() {
        if (status == null) status = "active";
    }

    private String contractLink;

    @ManyToOne
    @JoinColumn(name = "tenant_id")
    @JsonIgnoreProperties("contract")
    private Tenant tenant;

    @ManyToOne
    @JoinColumn(name = "room_num")
    private Room room;

}