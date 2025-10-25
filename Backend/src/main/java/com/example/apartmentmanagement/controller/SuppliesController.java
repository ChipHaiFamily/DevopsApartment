package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.Supplies;
import com.example.apartmentmanagement.service.SuppliesService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/supplies")
public class SuppliesController {
    private final SuppliesService service;

    public SuppliesController(SuppliesService service) {
        this.service = service;
    }

    @GetMapping
    public List<Supplies> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Supplies> getById(@PathVariable String id) {
        return service.findById(id);
    }

    @PostMapping
    public Supplies create(@RequestBody Supplies obj) {
        return service.save(obj);
    }

    @PutMapping("/{id}")
    public Supplies update(@PathVariable String id, @RequestBody Supplies obj) {
        obj.setItemId(id);
        return service.save(obj);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteById(id);
    }
}