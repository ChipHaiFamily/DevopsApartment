package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.Reservation;
import com.example.apartmentmanagement.model.Room;
import com.example.apartmentmanagement.repository.ReservationRepository;
import com.example.apartmentmanagement.repository.RoomRepository;
import lombok.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository repository;
    private final IdGenerationService idGenerationService;
    private final RoomRepository roomRepository;

    public List<Reservation> findAll() {
        return repository.findAll();
    }

    public Optional<Reservation> findById(String id) {
        return repository.findById(id);
    }

    public Reservation create(Reservation obj) {
        obj.setReservationNum(idGenerationService.generateReservationId());
        obj.setStatus("pending");
        return repository.save(obj);
    }

    public Reservation update(Reservation obj) {
        String roomNum = obj.getAssignedRoom();

        if (roomNum == null || roomNum.isEmpty()) {
            return repository.save(obj);
        }

        Room room = roomRepository.findById(roomNum)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomNum));

        if ("no_show".equals(obj.getStatus())) {
            room.setStatus("available");
        } else if ("processing".equals(obj.getStatus())) {
            room.setStatus("reserved");
        }
        roomRepository.save(room);
        return repository.save(obj);
    }

    public Reservation save(Reservation obj) {
        return repository.save(obj);
    }

    public void deleteById(String id) {
        repository.deleteById(id);
    }
}

