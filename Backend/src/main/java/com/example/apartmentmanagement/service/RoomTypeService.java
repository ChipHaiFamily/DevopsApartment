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
    public RoomType save(RoomType obj) { return repository.save(obj); }
    public void deleteById(String id) { repository.deleteById(id); }
}
