package com.example.apartmentmanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "tenants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {
    @Id
    @Column(name = "tenant_id", length = 20)
    private String tenantId;

    private String citizenId;
    private String emergencyContact;
    private String emergencyName;
    private String emergencyRelationship;

    @OneToOne
    @MapsId
    @JoinColumn(name = "tenant_id")
    @JsonManagedReference
    private User user;

    @OneToMany(mappedBy = "tenant")
    private List<Contract> contract;
}
