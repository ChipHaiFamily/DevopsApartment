package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.Supplies;
import com.example.apartmentmanagement.repository.SuppliesRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SuppliesService {
    private final SuppliesRepository repository;
    private final IdGenerationService idGenService;

    public SuppliesService(SuppliesRepository repository, IdGenerationService idGenService) {
        this.repository = repository;
        this.idGenService = idGenService;
    }

    public Supplies save(Supplies obj) {
        if (obj.getItemId() == null || obj.getItemId().isEmpty()) {
            obj.setItemId(idGenService.generateSupplyId());
        }

        if (obj.getQuantity() == 0) {
            obj.setStatus("out of stock");
        } else if (obj.getQuantity() < 10) {
            obj.setStatus("low stock");
        } else {
            obj.setStatus("in stock");
        }
        return repository.save(obj);
    }

    public List<Supplies> findAll() { return repository.findAll(); }
    public Optional<Supplies> findById(String id) { return repository.findById(id); }
    public void deleteById(String id) { repository.deleteById(id); }
}


