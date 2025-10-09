package com.example.apartmentmanagement.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "room_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomType {
    @Id
    @Column(length = 10)
    private String roomTypeId;

    private String name;
    private String description;
    private BigDecimal price;
    private String room_image;

}
