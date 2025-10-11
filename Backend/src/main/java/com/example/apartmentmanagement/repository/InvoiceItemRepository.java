package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {}
