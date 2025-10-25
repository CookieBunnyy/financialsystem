package com.cosc75.financialsystem.controller;

import com.cosc75.financialsystem.model.User;
import com.cosc75.financialsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // allows frontend (Next.js) to connect
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ✅ Test endpoint
    @GetMapping("/test")
    public String testConnection() {
        return "✅ UserController is working!";
    }

    // ✅ Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ✅ Add a new user
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

   @GetMapping("/{id}")
public ResponseEntity<User> getUserById(@PathVariable Long id) {
    return userRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
}


    // ✅ Delete a user
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return "User deleted successfully!";
    }

    // ✅ Update user
@PutMapping("/{id}")
public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
    return userRepository.findById(id)
        .map(user -> {
            user.setName(updatedUser.getName());
            user.setEmail(updatedUser.getEmail());
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                user.setPassword(updatedUser.getPassword());
            }
            userRepository.save(user);
            return ResponseEntity.ok(user);
        })
        .orElse(ResponseEntity.notFound().build());
}
}
