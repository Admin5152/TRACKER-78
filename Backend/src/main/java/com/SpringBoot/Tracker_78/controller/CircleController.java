package com.SpringBoot.Tracker_78.controller;

import com.SpringBoot.Tracker_78.dto.CircleMemberDTO;
import com.SpringBoot.Tracker_78.dto.response.JoinCircleResponseDTO;
import com.SpringBoot.Tracker_78.dto.response.CircleResponseDTO;
import com.SpringBoot.Tracker_78.dto.response.LocationResponseDTO;
import com.SpringBoot.Tracker_78.model.Circle;
import com.SpringBoot.Tracker_78.service.CircleService;
import com.SpringBoot.Tracker_78.security.AppwriteTokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/circles")
public class CircleController {

    @Autowired
    private CircleService circleService;

    @Autowired
    private AppwriteTokenService appwriteTokenService;

    // Create a new circle
    @PostMapping
    public ResponseEntity<?> createCircle(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody Circle circle) {
        try {
            String userId = appwriteTokenService.verifyTokenAndGetUserId(authHeader);
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid Appwrite token");
            }
            circle.setCreatorAppwriteId(userId);
            CircleResponseDTO response = circleService.createCircleWithInvite(circle);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to create circle: " + ex.getMessage());
        }
    }

    // Join a circle by userId and code
    @PostMapping("/join")
    public ResponseEntity<?> joinCircle(
            @RequestParam String code,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String appwriteId = appwriteTokenService.verifyTokenAndGetUserId(authHeader);
            if (appwriteId == null || appwriteId.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid Appwrite token");
            }
            if (code == null || code.isEmpty()) {
                return ResponseEntity.badRequest().body("Circle code is required");
            }
            JoinCircleResponseDTO response = circleService.joinCircleWithMembers(appwriteId, code);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to join circle: " + ex.getMessage());
        }
    }

    // Leave a circle
    @PostMapping("/leave")
    public ResponseEntity<?> leaveCircle(
            @RequestParam Long circleId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String appwriteId = appwriteTokenService.verifyTokenAndGetUserId(authHeader);
            if (appwriteId == null || appwriteId.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid Appwrite token");
            }
            if (circleId == null || circleId <= 0) {
                return ResponseEntity.badRequest().body("Invalid circleId");
            }
            circleService.leaveCircle(appwriteId, circleId);
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to leave circle: " + ex.getMessage());
        }
    }

    // Update circle name
    @PutMapping("/update-name")
    public ResponseEntity<?> updateCircleName(
            @RequestParam Long circleId,
            @RequestParam String newName,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String appwriteId = appwriteTokenService.verifyTokenAndGetUserId(authHeader);
            if (appwriteId == null || appwriteId.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid Appwrite token");
            }
            if (circleId == null || circleId <= 0) {
                return ResponseEntity.badRequest().body("Invalid circleId");
            }
            if (newName == null || newName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("New name is required");
            }
            CircleResponseDTO response = circleService.updateCircleName(circleId, newName);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to update circle name: " + ex.getMessage());
        }
    }

    // Get all member IDs of a circle
    @GetMapping("/{circleId}/members")
    public ResponseEntity<?> getMembers(
            @PathVariable Long circleId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String appwriteId = appwriteTokenService.verifyTokenAndGetUserId(authHeader);
            if (appwriteId == null || appwriteId.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid Appwrite token");
            }
            if (circleId == null || circleId <= 0) {
                return ResponseEntity.badRequest().body("Invalid circleId");
            }
            List<CircleMemberDTO> members = circleService.getMemberDTOs(circleId);
            return ResponseEntity.ok(members);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to get members: " + ex.getMessage());
        }
    }

    @DeleteMapping("/{circleId}/members/{userId}")
    public ResponseEntity<?> removeMember(
            @PathVariable Long circleId,
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String appwriteId = appwriteTokenService.verifyTokenAndGetUserId(authHeader);
            if (appwriteId == null || appwriteId.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid Appwrite token");
            }
            if (circleId == null || circleId <= 0 || userId == null || userId <= 0) {
                return ResponseEntity.badRequest().body("Invalid circleId or userId");
            }
            circleService.removeMemberFromCircle(circleId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to remove member: " + ex.getMessage());
        }
    }

    @GetMapping("/{circleId}/locations")
    public ResponseEntity<?> getAllMembersLocations(
            @PathVariable Long circleId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String appwriteId = appwriteTokenService.verifyTokenAndGetUserId(authHeader);
            if (appwriteId == null || appwriteId.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid Appwrite token");
            }
            if (circleId == null || circleId <= 0) {
                return ResponseEntity.badRequest().body("Invalid circleId");
            }
            List<LocationResponseDTO> locations = circleService.getAllMembersLatestLocations(circleId);
            return ResponseEntity.ok(locations);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to get locations: " + ex.getMessage());
        }
    }
}