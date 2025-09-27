package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.Contract;
import com.example.apartmentmanagement.service.ContractService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {
    private final ContractService service;
    public ContractController(ContractService service) { this.service = service; }
    @GetMapping public List<Contract> getAll() { return service.findAll(); }
    @GetMapping("/{id}") public Optional<Contract> getById(@PathVariable String id) { return service.findById(id); }
    @PostMapping public Contract create(@RequestBody Contract obj) { return service.create(obj); }
    @PutMapping("/{id}") public Contract update(@PathVariable String id, @RequestBody Contract obj) { obj.setContractNum(id); return service.save(obj); }
    @DeleteMapping("/{id}") public void delete(@PathVariable String id) { service.deleteById(id); }
}
