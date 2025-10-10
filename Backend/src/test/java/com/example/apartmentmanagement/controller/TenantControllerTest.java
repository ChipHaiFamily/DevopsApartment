package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.Tenant;
import com.example.apartmentmanagement.model.User;
import com.example.apartmentmanagement.repository.UserRepository;
import com.example.apartmentmanagement.service.TenantService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TenantControllerTest {

    @Mock
    private TenantService tenantService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TenantController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAll_returnsTenantList() {
        Tenant t1 = new Tenant(); t1.setTenantId("T1");
        Tenant t2 = new Tenant(); t2.setTenantId("T2");
        when(tenantService.findAll()).thenReturn(List.of(t1, t2));

        List<Tenant> result = controller.getAll();

        assertEquals(2, result.size());
        verify(tenantService).findAll();
    }

    @Test
    void getById_returnsOptionalTenant() {
        Tenant t = new Tenant(); t.setTenantId("T1");
        when(tenantService.findById("T1")).thenReturn(Optional.of(t));

        Optional<Tenant> result = controller.getById("T1");

        assertTrue(result.isPresent());
        assertEquals("T1", result.get().getTenantId());
        verify(tenantService).findById("T1");
    }

    @Test
    void create_attachesUserAndCreatesTenant() {
        User u = new User(); u.setId("U1");
        Tenant t = new Tenant(); t.setUser(u);
        Tenant saved = new Tenant(); saved.setTenantId("T1"); saved.setUser(u);

        when(userRepository.findById("U1")).thenReturn(Optional.of(u));
        when(tenantService.createTenant(any(Tenant.class))).thenReturn(saved);

        Tenant result = controller.create(t);

        assertEquals("T1", result.getTenantId());
        assertNotNull(result.getUser());
        verify(userRepository).findById("U1");
        verify(tenantService).createTenant(any(Tenant.class));
    }

    @Test
    void create_throwsExceptionWhenUserNotFound() {
        User u = new User(); u.setId("U1");
        Tenant t = new Tenant(); t.setUser(u);

        when(userRepository.findById("U1")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> controller.create(t));
        assertEquals("User not found with id: U1", ex.getMessage());
    }

    @Test
    void update_attachesUserAndUpdatesTenant() {
        User u = new User(); u.setId("U1");
        Tenant t = new Tenant(); t.setUser(u);
        Tenant updated = new Tenant(); updated.setTenantId("T2"); updated.setUser(u);

        when(userRepository.findById("U1")).thenReturn(Optional.of(u));
        when(tenantService.updateTenant(any(Tenant.class))).thenReturn(updated);

        Tenant result = controller.update("T2", t);

        assertEquals("T2", result.getTenantId());
        assertNotNull(result.getUser());
        verify(userRepository).findById("U1");
        verify(tenantService).updateTenant(any(Tenant.class));
    }

    @Test
    void delete_callsServiceDelete() {
        controller.delete("T3");
        verify(tenantService).deleteById("T3");
    }

    @Test
    void create_skipsWhenTenantHasNoUser() {
        Tenant tenant = new Tenant(); // ไม่มี user

        when(tenantService.createTenant(any(Tenant.class))).thenReturn(tenant);

        Tenant result = controller.create(tenant);

        assertSame(tenant, result);
        verify(userRepository, never()).findById(anyString());
        verify(tenantService).createTenant(tenant);
    }

    @Test
    void create_attachesUserWhenUserExists() {
        User user = new User(); user.setId("U1");
        Tenant tenant = new Tenant(); tenant.setUser(user);

        when(userRepository.findById("U1")).thenReturn(Optional.of(user));
        when(tenantService.createTenant(any(Tenant.class))).thenReturn(tenant);

        Tenant result = controller.create(tenant);

        assertNotNull(result.getUser());
        assertEquals("U1", result.getUser().getId());
        verify(userRepository).findById("U1");
        verify(tenantService).createTenant(tenant);
    }
}