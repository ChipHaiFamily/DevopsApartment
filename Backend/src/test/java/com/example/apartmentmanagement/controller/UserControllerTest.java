package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.User;
import com.example.apartmentmanagement.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createUser_callsServiceAndReturnsUser() {
        User u = new User(); u.setId("USR-001");
        when(userService.createUser(u)).thenReturn(u);

        User result = controller.createUser(u);

        assertEquals("USR-001", result.getId());
        verify(userService).createUser(u);
    }

    @Test
    void getAllUsers_returnsListFromService() {
        User u1 = new User(); u1.setId("USR-001");
        User u2 = new User(); u2.setId("USR-002");
        when(userService.getAllUsers()).thenReturn(List.of(u1, u2));

        List<User> result = controller.getAllUsers();

        assertEquals(2, result.size());
        verify(userService).getAllUsers();
    }

    @Test
    void getUserById_returnsOkWhenFound() {
        User u = new User(); u.setId("USR-001");
        when(userService.getUserById("USR-001")).thenReturn(Optional.of(u));

        ResponseEntity<User> response = controller.getUserById("USR-001");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(u, response.getBody());
        verify(userService).getUserById("USR-001");
    }

    @Test
    void getUserById_returnsNotFoundWhenMissing() {
        when(userService.getUserById("USR-999")).thenReturn(Optional.empty());

        ResponseEntity<User> response = controller.getUserById("USR-999");

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(userService).getUserById("USR-999");
    }

    @Test
    void updateUser_callsServiceAndReturnsUpdated() {
        User u = new User(); u.setId("USR-001");
        when(userService.updateUser("USR-001", u)).thenReturn(u);

        ResponseEntity<User> response = controller.updateUser("USR-001", u);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(u, response.getBody());
        verify(userService).updateUser("USR-001", u);
    }

    @Test
    void deleteUser_callsServiceAndReturnsNoContent() {
        ResponseEntity<Void> response = controller.deleteUser("USR-001");

        assertEquals(204, response.getStatusCodeValue());
        verify(userService).deleteUser("USR-001");
    }
}