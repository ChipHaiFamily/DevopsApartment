package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, String> {
}

