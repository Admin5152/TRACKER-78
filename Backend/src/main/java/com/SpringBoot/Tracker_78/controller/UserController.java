package com.SpringBoot.Tracker_78.controller;

import com.SpringBoot.Tracker_78.dto.UserDTO;
import com.SpringBoot.Tracker_78.service.UserService;
import com.SpringBoot.Tracker_78.security.AppwriteTokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AppwriteTokenService appwriteTokenService;

    @GetMapping("/{appwriteId}")
    public ResponseEntity<?> getUser(@PathVariable String appwriteId) {
        try {
            if (appwriteId == null || appwriteId.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid appwriteId");
            }
            UserDTO user = userService.getUserByAppwriteId(appwriteId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(user);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to fetch user: " + ex.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserDTO> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to fetch users: " + ex.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UserDTO userDTO) {
        try {
            String appwriteId = appwriteTokenService.verifyTokenAndGetUserId(authHeader);
            if (appwriteId == null || appwriteId.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid Appwrite token");
            }
            userDTO.setAppwriteId(appwriteId);
            UserDTO createdUser = userService.createUser(userDTO);
            return ResponseEntity.ok(createdUser);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to create user: " + ex.getMessage());
        }
    }

    @PutMapping("/{appwriteId}")
    public ResponseEntity<?> updateUser(@PathVariable String appwriteId, @Valid @RequestBody UserDTO userDTO) {
        try {
            if (appwriteId == null || appwriteId.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid appwriteId");
            }
            UserDTO updatedUser = userService.updateUser(appwriteId, userDTO);
            if (updatedUser == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedUser);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to update user: " + ex.getMessage());
        }
    }

    @DeleteMapping("/{appwriteId}")
    public ResponseEntity<?> deleteUser(@PathVariable String appwriteId) {
        try {
            if (appwriteId == null || appwriteId.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid appwriteId");
            }
            userService.deleteUser(appwriteId);
            return ResponseEntity.noContent().build();
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to delete user: " + ex.getMessage());
        }
    }
}