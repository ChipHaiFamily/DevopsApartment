package com.example.apartmentmanagement.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "supplies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplies {
    @Id
    @Column(length = 20)
    private String itemId;

    private String itemName;
    private int quantity;
    private String status;
}
