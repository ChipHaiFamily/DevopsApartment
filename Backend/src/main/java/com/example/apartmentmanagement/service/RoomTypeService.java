package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.RoomType;
import com.example.apartmentmanagement.repository.RoomTypeRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RoomTypeService {
    private final RoomTypeRepository repository;
    public RoomTypeService(RoomTypeRepository repository) { this.repository = repository; }
    public List<RoomType> findAll() { return repository.findAll(); }
    public Optional<RoomType> findById(String id) { return repository.findById(id); }
    public RoomType save(RoomType obj) {
        if (obj.getRoomTypeId() == null || obj.getRoomTypeId().isEmpty()) {
            String lastId = repository.findTopByOrderByRoomTypeIdDesc()
                    .map(RoomType::getRoomTypeId)
                    .orElse(null);
            int nextNum = 1;
            if (lastId != null && lastId.startsWith("RT")) {
                try {
                    nextNum = Integer.parseInt(lastId.substring(2)) + 1;
                } catch (NumberFormatException e) {
                    nextNum = 1;
                }
            }
            obj.setRoomTypeId(String.format("RT%02d", nextNum)); // RT01, RT02, ...
        }

        return repository.save(obj);
    }

    public void deleteById(String id) { repository.deleteById(id); }
}
