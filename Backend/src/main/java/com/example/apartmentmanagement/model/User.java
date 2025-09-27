package com.example.apartmentmanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(length = 20)
    private String id;

    @Column(nullable = false)
    private String passwd;

    @Column(nullable = false)
    private String email;

    private String tel;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String sex;
    private String job;
    private String workplace;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private Tenant tenant;
}
