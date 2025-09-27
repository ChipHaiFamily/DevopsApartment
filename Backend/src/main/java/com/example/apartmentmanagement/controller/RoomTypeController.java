package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.RoomType;
import com.example.apartmentmanagement.service.RoomTypeService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/room-types")
public class RoomTypeController {
    private final RoomTypeService service;
    public RoomTypeController(RoomTypeService service) { this.service = service; }
    @GetMapping public List<RoomType> getAll() { return service.findAll(); }
    @GetMapping("/{id}") public Optional<RoomType> getById(@PathVariable String id) { return service.findById(id); }
    @PostMapping public RoomType create(@RequestBody RoomType obj) { return service.save(obj); }
    @PutMapping("/{id}") public RoomType update(@PathVariable String id, @RequestBody RoomType obj) { obj.setRoomTypeId(id); return service.save(obj); }
    @DeleteMapping("/{id}") public void delete(@PathVariable String id) { service.deleteById(id); }
}
