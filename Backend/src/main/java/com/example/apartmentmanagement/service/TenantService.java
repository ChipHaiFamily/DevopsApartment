package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.Tenant;
import com.example.apartmentmanagement.repository.TenantRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TenantService {
    private final TenantRepository tenantRepository;

    @PersistenceContext
    private EntityManager em;

    public TenantService(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    public List<Tenant> findAll() {
        return tenantRepository.findAll();
    }

    public Optional<Tenant> findById(String id) {
        return tenantRepository.findById(id);
    }

    @Transactional
    public Tenant createTenant(Tenant tenant) {
        em.persist(tenant);
        return tenant;
    }

    public Tenant updateTenant(Tenant tenant) {
        return tenantRepository.save(tenant);
    }

    public void deleteById(String id) {
        tenantRepository.deleteById(id);
    }

    public int countTenants() {
        return (int) tenantRepository.count();
    }
}
