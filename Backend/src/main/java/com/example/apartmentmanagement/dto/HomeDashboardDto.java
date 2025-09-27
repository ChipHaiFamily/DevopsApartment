package com.example.apartmentmanagement.dto;

import com.example.apartmentmanagement.model.RoomType;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class HomeDashboardDto {
    private int countRooms;
    private int countRentedRooms;
    private int countTenants;
    private List<RoomType> roomTypes;
}


