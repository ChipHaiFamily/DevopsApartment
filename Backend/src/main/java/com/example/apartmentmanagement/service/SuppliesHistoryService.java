package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.Supplies;
import com.example.apartmentmanagement.model.SuppliesHistory;
import com.example.apartmentmanagement.repository.SuppliesHistoryRepository;
import com.example.apartmentmanagement.repository.SuppliesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SuppliesHistoryService {

    private final SuppliesHistoryRepository historyRepository;
    private final SuppliesRepository suppliesRepository;
    private final IdGenerationService idGenService;

    @Transactional
    public SuppliesHistory save(SuppliesHistory obj) {
        obj.setHistoryId(idGenService.generateSupplyHistoryId());

        if (obj.getDate() == null) {
            obj.setDate(LocalDate.now());
        }

        if (obj.getItemId() == null || obj.getItemId().getItemId() == null) {
            throw new IllegalArgumentException("itemId is required");
        }

        Supplies actualSupply = suppliesRepository.findById(obj.getItemId().getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Supply not found: " + obj.getItemId().getItemId()));

        obj.setItemId(actualSupply);

        int qtyChange = obj.getQuantity() != null ? obj.getQuantity() : 0;

        switch (obj.getAction().toLowerCase()) {
            case "use":
            case "withdraw":
            case "เบิกใช้":
                actualSupply.setQuantity(actualSupply.getQuantity() - qtyChange);
                break;
            case "add":
            case "restock":
            case "return":
            case "เติม":
            case "คืน":
                actualSupply.setQuantity(actualSupply.getQuantity() + qtyChange);
                break;
            default:
                throw new IllegalArgumentException("Unknown action: " + obj.getAction());
        }

        if (actualSupply.getQuantity() <= 0) {
            actualSupply.setQuantity(0);
            actualSupply.setStatus("Out of Stock");
        } else if (actualSupply.getQuantity() < 10) {
            actualSupply.setStatus("Low Stock");
        } else {
            actualSupply.setStatus("In Stock");
        }

        suppliesRepository.save(actualSupply);

        return historyRepository.save(obj);
    }

    public List<SuppliesHistory> findAll() {
        return historyRepository.findAll();
    }

    public Optional<SuppliesHistory> findById(String id) {
        return historyRepository.findById(id);
    }

    public void deleteById(String id) {
        historyRepository.deleteById(id);
    }
}
