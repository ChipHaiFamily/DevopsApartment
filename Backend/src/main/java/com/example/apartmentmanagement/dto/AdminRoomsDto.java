package com.example.apartmentmanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminRoomsDto {
    private int totalRooms;
    private int vacantRooms;
    private int rentedRooms;
    private int maintenanceRooms;

    private List<RoomDto> rooms; // ใช้ RoomDto ที่ขยายแล้ว
}
