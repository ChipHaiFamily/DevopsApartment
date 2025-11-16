package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.User;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        user1 = User.builder()
                .id("USR-001")
                .fullName("Alice")
                .email("alice@example.com")
                .passwd("pass123")
                .build();

        user2 = User.builder()
                .id("USR-002")
                .fullName("Bob")
                .email("bob@example.com")
                .passwd("password")
                .build();

        entityManager.persist(user1);
        entityManager.persist(user2);
        entityManager.flush();
    }

    @Test
    @DisplayName("Should find user by email")
    void testFindByEmail() {
        Optional<User> found = userRepository.findByEmail("alice@example.com");
        assertTrue(found.isPresent());
        assertEquals("USR-001", found.get().getId());

        Optional<User> notFound = userRepository.findByEmail("nonexistent@example.com");
        assertFalse(notFound.isPresent());
    }

    @Test
    @DisplayName("Should find top user by id descending")
    void testFindTopByOrderByIdDesc() {
        Optional<User> topUser = userRepository.findTopByOrderByIdDesc();
        assertTrue(topUser.isPresent());
        assertEquals("USR-002", topUser.get().getId());
    }
}
