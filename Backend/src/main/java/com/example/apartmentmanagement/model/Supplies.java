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
    @Column(name = "itemid", length = 20)
    private String itemId;

    private String item_Name;
    private Integer quantity;
    private String status;
}
