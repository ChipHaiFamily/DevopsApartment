package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.Contract;
import com.example.apartmentmanagement.model.Room;
import com.example.apartmentmanagement.repository.ContractRepository;
import com.example.apartmentmanagement.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import lombok.*;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ContractService {
    private final ContractRepository repository;
    private final RoomRepository roomRepository;
    private final IdGenerationService idGenerationService;

    public List<Contract> findAll() {
        return repository.findAll();
    }

    public Optional<Contract> findById(String id) {
        return repository.findById(id);
    }

    public Contract create(Contract obj) {
        obj.setContractNum(idGenerationService.generateContractId());
        if (obj.getRoom() != null) {
            String roomNum = obj.getRoom().getRoomNum();
            Room room = roomRepository.findById(roomNum)
                    .orElseThrow(() -> new RuntimeException("Room not found: " + roomNum));
            room.setStatus("occupied");
            obj.setStatus("active");

            double price = room.getRoomType().getPrice().doubleValue();
            obj.setRentAmount(price);
            obj.setDeposit(price * 2);
        }

        if (repository.existsById(obj.getContractNum())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Contract with ID " + obj.getContractNum() + " already exists"
            );
        }
        return repository.save(obj);
    }

    public Contract save(Contract obj) {
        return repository.save(obj);
    }

    public void deleteById(String id) {
        repository.deleteById(id);
    }
}
