package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.User;
import com.example.apartmentmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final IdGenerationService idGenerationService;

    public User updateUser(String id, User updatedUser) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updatedUser.getPasswd() != null && !updatedUser.getPasswd().isBlank()) {
            existingUser.setPasswd(passwordEncoder.encode(updatedUser.getPasswd()));
        }
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setTel(updatedUser.getTel());
        existingUser.setFullName(updatedUser.getFullName());
        existingUser.setSex(updatedUser.getSex());
        existingUser.setJob(updatedUser.getJob());
        existingUser.setWorkplace(updatedUser.getWorkplace());

        return userRepository.save(existingUser);
    }

    public User createUser(User user) {
        user.setId(idGenerationService.generateUserId());
        user.setPasswd(passwordEncoder.encode(user.getPasswd()));
        return userRepository.save(user);
    }

    public boolean login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return passwordEncoder.matches(rawPassword, user.getPasswd());
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
}
