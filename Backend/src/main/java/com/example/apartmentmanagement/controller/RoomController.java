package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.dto.*;
import com.example.apartmentmanagement.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoomDto>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoomDto>> create(@RequestBody RoomDto dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Room created", service.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomDto>> update(@PathVariable String id, @RequestBody RoomDto dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Room updated", service.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        service.deleteById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Room deleted", null));
    }
}
