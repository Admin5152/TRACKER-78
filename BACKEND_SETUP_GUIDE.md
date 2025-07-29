# Backend Setup Guide

## Current Error Status
The app is showing JSON parse errors because the backend endpoints don't exist yet. Here's how to fix them:

## Required Endpoints

### 1. Health Check Endpoint
```java
@RestController
@RequestMapping("/api")
public class HealthController {
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running");
    }
}
```

### 2. Authentication Endpoints
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        // Implement login logic
        return ResponseEntity.ok(new AuthResponse(token, user));
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        // Implement registration logic
        return ResponseEntity.ok(new AuthResponse(token, user));
    }
    
    @GetMapping("/verify")
    public ResponseEntity<String> verifyToken(@RequestHeader("Authorization") String token) {
        // Verify JWT token
        return ResponseEntity.ok("Token is valid");
    }
}
```

### 3. User Management Endpoints
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String q) {
        // Search users by ID or email
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserProfile(@PathVariable String userId) {
        // Get user profile
        return ResponseEntity.ok(user);
    }
}
```

### 4. Friend Request Endpoints
```java
@RestController
@RequestMapping("/api/friend-requests")
public class FriendRequestController {
    @PostMapping
    public ResponseEntity<FriendRequest> sendRequest(@RequestBody FriendRequestRequest request) {
        // Send friend request
        return ResponseEntity.ok(friendRequest);
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<FriendRequest>> getPendingRequests() {
        // Get pending requests for current user
        return ResponseEntity.ok(pendingRequests);
    }
    
    @PutMapping("/{id}/accept")
    public ResponseEntity<FriendRequest> acceptRequest(@PathVariable String id) {
        // Accept friend request
        return ResponseEntity.ok(updatedRequest);
    }
    
    @PutMapping("/{id}/reject")
    public ResponseEntity<FriendRequest> rejectRequest(@PathVariable String id) {
        // Reject friend request
        return ResponseEntity.ok(updatedRequest);
    }
}
```

### 5. Location Management Endpoints
```java
@RestController
@RequestMapping("/api/locations")
public class LocationController {
    @PostMapping
    public ResponseEntity<Location> updateLocation(@RequestBody LocationRequest request) {
        // Update user location
        return ResponseEntity.ok(location);
    }
    
    @GetMapping("/user/{userId}/current")
    public ResponseEntity<Location> getCurrentLocation(@PathVariable String userId) {
        // Get user's current location
        return ResponseEntity.ok(location);
    }
    
    @GetMapping("/friends")
    public ResponseEntity<List<FriendLocation>> getFriendsLocations() {
        // Get all friends' locations for current user
        return ResponseEntity.ok(friendsLocations);
    }
}
```

### 6. Location Sharing Endpoints
```java
@RestController
@RequestMapping("/api/location-sharing")
public class LocationSharingController {
    @PostMapping("/enable")
    public ResponseEntity<String> enableLocationSharing(@RequestBody LocationSharingRequest request) {
        // Enable location sharing for a friend
        return ResponseEntity.ok("Location sharing enabled");
    }
    
    @PostMapping("/disable")
    public ResponseEntity<String> disableLocationSharing(@RequestBody LocationSharingRequest request) {
        // Disable location sharing for a friend
        return ResponseEntity.ok("Location sharing disabled");
    }
    
    @GetMapping("/friends")
    public ResponseEntity<List<User>> getFriendsSharingLocation() {
        // Get friends who are sharing location with current user
        return ResponseEntity.ok(friends);
    }
}
```

## Data Models

### User
```java
public class User {
    private String id;
    private String name;
    private String email;
    private String createdAt;
    // getters and setters
}
```

### FriendRequest
```java
public class FriendRequest {
    private String id;
    private String senderId;
    private String receiverId;
    private String status; // "PENDING", "ACCEPTED", "REJECTED"
    private String createdAt;
    // getters and setters
}
```

### Location
```java
public class Location {
    private String id;
    private String userId;
    private Double latitude;
    private Double longitude;
    private String timestamp;
    // getters and setters
}
```

### LocationSharingRequest
```java
public class LocationSharingRequest {
    private String friendId;
    // getters and setters
}
```

## Quick Fix for Testing

If you want to test the app immediately without implementing all endpoints, you can add these simple endpoints that return empty arrays:

```java
@RestController
@RequestMapping("/api")
public class TestController {
    @GetMapping("/locations/friends")
    public ResponseEntity<List<Object>> getFriendsLocations() {
        return ResponseEntity.ok(new ArrayList<>());
    }
    
    @GetMapping("/friend-requests/pending")
    public ResponseEntity<List<Object>> getPendingRequests() {
        return ResponseEntity.ok(new ArrayList<>());
    }
    
    @GetMapping("/users/search")
    public ResponseEntity<List<Object>> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(new ArrayList<>());
    }
    
    @GetMapping("/location-sharing/friends")
    public ResponseEntity<List<Object>> getFriendsSharingLocation() {
        return ResponseEntity.ok(new ArrayList<>());
    }
}
```

## Testing the Backend

1. **Start your Spring Boot application**
2. **Test the health endpoint**: `GET https://tracker-78-backend.onrender.com/api/health`
3. **Check if it returns**: `"Backend is running"`
4. **Test other endpoints** with Postman or curl

## Common Issues

### 1. CORS Errors
Add CORS configuration to your Spring Boot app:
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 2. Authentication Issues
Make sure your JWT token is being sent correctly in the Authorization header.

### 3. Database Issues
Ensure your database is properly configured and tables exist.

## Next Steps

1. **Implement the health endpoint first** to verify the backend is accessible
2. **Add authentication endpoints** for login/register
3. **Implement user management** for searching users
4. **Add friend request functionality**
5. **Implement location tracking**
6. **Add location sharing controls**

Once these endpoints are implemented, the JSON parse errors will be resolved and the app will work with real backend data. 