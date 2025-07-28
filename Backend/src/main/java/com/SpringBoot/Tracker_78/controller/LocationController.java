package com.SpringBoot.Tracker_78.controller;

import com.SpringBoot.Tracker_78.dto.request.LocationUpdateRequestDTO;
import com.SpringBoot.Tracker_78.dto.response.LocationResponseDTO;
import com.SpringBoot.Tracker_78.service.LocationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @PostMapping("/update")
    public ResponseEntity<?> updateLocation(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody LocationUpdateRequestDTO request) {
        try {
            if (authHeader == null || authHeader.isEmpty()) {
                return ResponseEntity.badRequest().body("Missing or invalid Authorization header");
            }
            String userId = extractUserIdFromAuthHeader(authHeader);
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid userId extracted from Authorization header");
            }
            LocationResponseDTO location = locationService.updateLocation(userId, request);
            return ResponseEntity.ok(location);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to update location: " + ex.getMessage());
        }
    }

    private String extractUserIdFromAuthHeader(String authHeader) {
        // TODO: Implement JWT/Appwrite token parsing for userId extraction
        // For demo: return authHeader directly
        return authHeader;
    }

    @GetMapping("/{appwriteId}")
    public ResponseEntity<?> getCurrentLocation(@PathVariable String appwriteId) {
        try {
            if (appwriteId == null || appwriteId.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid appwriteId");
            }
            LocationResponseDTO location = locationService.getCurrentLocation(appwriteId);
            return ResponseEntity.ok(location);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to get current location: " + ex.getMessage());
        }
    }

    @GetMapping("/circle/{circleId}")
    public ResponseEntity<?> getCircleLocations(@PathVariable Long circleId) {
        try {
            if (circleId == null || circleId <= 0) {
                return ResponseEntity.badRequest().body("Invalid circleId");
            }
            List<LocationResponseDTO> locations = locationService.getCircleLocations(circleId);
            return ResponseEntity.ok(locations);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to get circle locations: " + ex.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> sendLocation(@Valid @RequestBody LocationUpdateRequestDTO request) {
        try {
            LocationResponseDTO location = locationService.saveLocation(request);
            return ResponseEntity.ok(location);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to send location: " + ex.getMessage());
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestLocation(@RequestParam String userId) {
        try {
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid userId");
            }
            LocationResponseDTO location = locationService.getLatestLocation(userId);
            return ResponseEntity.ok(location);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to get latest location: " + ex.getMessage());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getLocationHistory(
            @RequestParam String userId,
            @RequestParam LocalDateTime from,
            @RequestParam LocalDateTime to) {
        try {
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid userId");
            }
            if (from == null || to == null || from.isAfter(to)) {
                return ResponseEntity.badRequest().body("Invalid date range");
            }
            List<LocationResponseDTO> history = locationService.getLocationHistory(userId, from, to);
            return ResponseEntity.ok(history);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to get location history: " + ex.getMessage());
        }
    }
}