package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.User;
import com.example.apartmentmanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private IdGenerationService idGenerationService;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createUser_generatesIdAndEncodesPassword() {
        User u = new User();
        u.setPasswd("plain123");

        when(idGenerationService.generateUserId()).thenReturn("USR-001");
        when(passwordEncoder.encode("plain123")).thenReturn("encoded123");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User created = userService.createUser(u);

        assertEquals("USR-001", created.getId());
        assertEquals("encoded123", created.getPasswd());
        verify(userRepository, times(1)).save(u);
    }

    @Test
    void updateUser_updatesExistingFields() {
        User existing = new User();
        existing.setId("USR-001");
        existing.setPasswd("oldPass");

        User updateData = new User();
        updateData.setPasswd("newPass");
        updateData.setEmail("new@mail.com");
        updateData.setTel("0999999999");
        updateData.setFullName("New Name");
        updateData.setSex("female");
        updateData.setJob("Engineer");
        updateData.setWorkplace("Company");

        when(userRepository.findById("USR-001")).thenReturn(Optional.of(existing));
        when(passwordEncoder.encode("newPass")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User updated = userService.updateUser("USR-001", updateData);

        assertEquals("encodedPass", updated.getPasswd());
        assertEquals("new@mail.com", updated.getEmail());
        assertEquals("0999999999", updated.getTel());
        assertEquals("New Name", updated.getFullName());
        assertEquals("female", updated.getSex());
        assertEquals("Engineer", updated.getJob());
        assertEquals("Company", updated.getWorkplace());
    }

    @Test
    void updateUser_withoutPasswordChange_doesNotEncode() {
        User existing = new User();
        existing.setId("USR-002");
        existing.setPasswd("oldPass");

        User updateData = new User();
        updateData.setEmail("update@mail.com");

        when(userRepository.findById("USR-002")).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User updated = userService.updateUser("USR-002", updateData);

        assertEquals("oldPass", updated.getPasswd()); // password ไม่เปลี่ยน
        assertEquals("update@mail.com", updated.getEmail());
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void updateUser_withBlankPassword_doesNotEncode() {
        User existing = new User();
        existing.setId("USR-003");
        existing.setPasswd("oldPass");

        User updateData = new User();
        updateData.setPasswd("  ");

        when(userRepository.findById("USR-003")).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User updated = userService.updateUser("USR-003", updateData);

        assertEquals("oldPass", updated.getPasswd());
        verify(passwordEncoder, never()).encode(anyString());
    }


    @Test
    void login_successfulWhenPasswordMatches() {
        User u = new User();
        u.setEmail("test@mail.com");
        u.setPasswd("encodedPass");

        when(userRepository.findByEmail("test@mail.com")).thenReturn(Optional.of(u));
        when(passwordEncoder.matches("rawPass", "encodedPass")).thenReturn(true);

        boolean result = userService.login("test@mail.com", "rawPass");

        assertTrue(result);
    }

    @Test
    void login_failsWhenPasswordDoesNotMatch() {
        User u = new User();
        u.setEmail("test@mail.com");
        u.setPasswd("encodedPass");

        when(userRepository.findByEmail("test@mail.com")).thenReturn(Optional.of(u));
        when(passwordEncoder.matches("wrongPass", "encodedPass")).thenReturn(false);

        boolean result = userService.login("test@mail.com", "wrongPass");

        assertFalse(result);
    }

    @Test
    void findByEmail_returnsUser() {
        User u = new User();
        u.setEmail("find@mail.com");

        when(userRepository.findByEmail("find@mail.com")).thenReturn(Optional.of(u));

        Optional<User> result = userService.findByEmail("find@mail.com");
        assertTrue(result.isPresent());
        assertEquals("find@mail.com", result.get().getEmail());
    }

    @Test
    void getAllUsers_returnsList() {
        User u1 = new User(); u1.setId("USR-001");
        User u2 = new User(); u2.setId("USR-002");

        when(userRepository.findAll()).thenReturn(List.of(u1, u2));

        List<User> list = userService.getAllUsers();
        assertEquals(2, list.size());
    }

    @Test
    void getUserById_returnsUser() {
        User u = new User(); u.setId("USR-010");

        when(userRepository.findById("USR-010")).thenReturn(Optional.of(u));

        Optional<User> result = userService.getUserById("USR-010");
        assertTrue(result.isPresent());
        assertEquals("USR-010", result.get().getId());
    }

    @Test
    void deleteUser_callsRepositoryDelete() {
        userService.deleteUser("USR-100");
        verify(userRepository, times(1)).deleteById("USR-100");
    }
}
