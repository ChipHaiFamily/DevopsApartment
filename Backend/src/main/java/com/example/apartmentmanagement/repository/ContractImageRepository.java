package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.ContractImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContractImageRepository extends JpaRepository<ContractImage, Long> {
    List<ContractImage> findByContractNum(String contractNum);
}
