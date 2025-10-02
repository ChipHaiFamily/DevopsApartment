package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.Tenant;
import com.example.apartmentmanagement.repository.TenantRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TenantServiceTest {

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private TenantService tenantService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(tenantService, "em", entityManager);
    }

    @Test
    void findAll_returnsAllTenants() {
        Tenant t1 = new Tenant();
        t1.setTenantId("USR-001");
        Tenant t2 = new Tenant();
        t2.setTenantId("USR-002");

        when(tenantRepository.findAll()).thenReturn(List.of(t1, t2));

        List<Tenant> list = tenantService.findAll();
        assertEquals(2, list.size());
        assertEquals("USR-001", list.get(0).getTenantId());
    }

    @Test
    void findById_existingId_returnsTenant() {
        Tenant t = new Tenant();
        t.setTenantId("USR-001");

        when(tenantRepository.findById("USR-001")).thenReturn(Optional.of(t));

        Optional<Tenant> result = tenantService.findById("USR-001");
        assertTrue(result.isPresent());
        assertEquals("USR-001", result.get().getTenantId());
    }

    @Test
    void createTenant_persistsTenant() {
        Tenant t = new Tenant();
        t.setTenantId("USR-003");

        doNothing().when(entityManager).persist(t);

        Tenant result = tenantService.createTenant(t);

        assertEquals("USR-003", result.getTenantId());
        verify(entityManager, times(1)).persist(t);
    }

    @Test
    void updateTenant_savesTenant() {
        Tenant t = new Tenant();
        t.setTenantId("USR-004");

        when(tenantRepository.save(t)).thenReturn(t);

        Tenant result = tenantService.updateTenant(t);
        assertEquals("USR-004", result.getTenantId());
    }

    @Test
    void deleteById_callsRepositoryDelete() {
        tenantService.deleteById("USR-005");
        verify(tenantRepository, times(1)).deleteById("USR-005");
    }

    @Test
    void countTenants_returnsCount() {
        when(tenantRepository.count()).thenReturn(7L);
        int count = tenantService.countTenants();
        assertEquals(7, count);
    }
}