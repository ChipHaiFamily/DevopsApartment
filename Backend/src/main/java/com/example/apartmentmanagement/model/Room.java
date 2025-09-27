package com.example.apartmentmanagement.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {
    @Id
    @Column(length = 10)
    private String roomNum;

    private int floor;
    private String status;

    @ManyToOne
    @JoinColumn(name = "room_type_id")
    private RoomType roomType;

}

