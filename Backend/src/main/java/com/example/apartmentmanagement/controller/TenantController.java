package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.Tenant;
import com.example.apartmentmanagement.model.User;
import com.example.apartmentmanagement.repository.UserRepository;
import com.example.apartmentmanagement.service.TenantService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {
    private final TenantService tenantService;
    private final UserRepository userRepository;

    public TenantController(TenantService tenantService, UserRepository userRepository) {
        this.tenantService = tenantService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Tenant> getAll() {
        return tenantService.findAll();
    }

    @GetMapping("/{tenantId}")
    public Optional<Tenant> getById(@PathVariable String tenantId) {
        return tenantService.findById(tenantId);
    }

    @PostMapping
    public Tenant create(@RequestBody Tenant tenant) {
        attachUser(tenant);
        return tenantService.createTenant(tenant);
    }

    @PutMapping("/{tenantId}")
    public Tenant update(@PathVariable String tenantId, @RequestBody Tenant tenant) {
        tenant.setTenantId(tenantId);
        attachUser(tenant);
        return tenantService.updateTenant(tenant);
    }

    @DeleteMapping("/{tenantId}")
    public void delete(@PathVariable String tenantId) {
        tenantService.deleteById(tenantId);
    }

    private void attachUser(Tenant tenant) {
        if (tenant.getUser() != null && tenant.getUser().getId() != null) {
            User user = userRepository.findById(tenant.getUser().getId())
                    .orElseThrow(() -> new RuntimeException(
                            "User not found with id: " + tenant.getUser().getId()));
            tenant.setUser(user);
        }
    }
}
