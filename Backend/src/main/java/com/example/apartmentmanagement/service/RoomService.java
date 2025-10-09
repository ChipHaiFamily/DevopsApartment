package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.RoomDto;
import com.example.apartmentmanagement.model.Room;
import com.example.apartmentmanagement.exception.ResourceNotFoundException;
import com.example.apartmentmanagement.model.Tenant;
import com.example.apartmentmanagement.model.User;
import com.example.apartmentmanagement.repository.ContractRepository;
import com.example.apartmentmanagement.repository.RoomRepository;
import com.example.apartmentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository repository;
    private final ContractRepository contractRepo;
    private final UserRepository userRepo;


    private RoomDto mapToDto(Room r) {
        String tenantFullName = contractRepo
                .findByRoom_RoomNum(r.getRoomNum())
                .stream()
                .filter(c -> "active".equalsIgnoreCase(c.getStatus()))
                .findFirst()
                .map(contract -> {
                    Tenant tenant = contract.getTenant();
                    return (tenant != null && tenant.getUser() != null)
                            ? tenant.getUser().getFullName() : null;
                })
                .orElse(null);

        return RoomDto.builder()
                .roomNum(r.getRoomNum())
                .floor(r.getFloor())
                .status(r.getStatus())
                .roomTypeName(r.getRoomType() != null ? r.getRoomType().getName() : null)
                .price(r.getRoomType() != null ? r.getRoomType().getPrice() : null)
                .tenantName(tenantFullName)
                .build();
    }

    public List<RoomDto> findAll() {
        return repository.findAll().stream().map(this::mapToDto).toList();
    }

    public RoomDto findById(String id) {
        Room room = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        return mapToDto(room);
    }

    public RoomDto create(RoomDto dto) {
        Room room = Room.builder()
                .roomNum(dto.getRoomNum())
                .floor(dto.getFloor())
                .status(dto.getStatus())
                .build();
        Room saved = repository.save(room);
        return mapToDto(saved);
    }

    public RoomDto update(String id, RoomDto dto) {
        Room room = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        room.setFloor(dto.getFloor());
        room.setStatus(dto.getStatus());
        Room updated = repository.save(room);
        return mapToDto(updated);
    }

    public int countRooms() {
        return (int) repository.count();
    }

    public int countRentedRooms() {
        return (int) repository.findAll().stream()
                .filter(r -> "OCCUPIED".equalsIgnoreCase(r.getStatus()))
                .count();
    }

    public List<RoomDto> getRoomStatuses() {
        return repository.findAll().stream().map(this::mapToDto).toList();
    }
}

