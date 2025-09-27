package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.Reservation;
import com.example.apartmentmanagement.service.ReservationService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    private final ReservationService service;
    public ReservationController(ReservationService service) { this.service = service; }
    @GetMapping public List<Reservation> getAll() { return service.findAll(); }
    @GetMapping("/{id}") public Optional<Reservation> getById(@PathVariable String id) { return service.findById(id); }
    @PostMapping public Reservation create(@RequestBody Reservation obj) { return service.create(obj); }
    @PutMapping("/{id}") public Reservation update(@PathVariable String id, @RequestBody Reservation obj) { obj.setReservationNum(id); return service.update(obj); }
    @DeleteMapping("/{id}") public void delete(@PathVariable String id) { service.deleteById(id); }
}
