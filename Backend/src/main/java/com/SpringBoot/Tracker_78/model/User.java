// src/main/java/com/SpringBoot/Tracker_78/model/User.java
package com.SpringBoot.Tracker_78.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "users")
@Schema(description = "Entity representing a user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique identifier of the user", example = "1")
    private Long id;

    @NotBlank(message = "Appwrite ID cannot be blank")
    @Column(nullable = false, unique = true)
    @Schema(description = "Appwrite ID of the user", example = "user123", required = true)
    private String appwriteId;

    @NotBlank(message = "Name cannot be blank")
    @Column(nullable = false)
    @Schema(description = "Name of the user", example = "Alice Smith", required = true)
    private String name;

    @NotBlank(message = "Email cannot be blank")
    @Column(nullable = false, unique = true)
    @Schema(description = "Email address of the user", example = "alice@example.com", required = true)
    private String email;

    @Schema(description = "URL to user's profile picture", example = "https://example.com/profile.jpg")
    private String profilePicture;

    @Schema(description = "Battery level of the user's device", example = "85")
    private Integer batteryLevel;

    @Schema(description = "User's phone number", example = "+1234567890")
    private String phone;

    @NotBlank(message = "Username cannot be blank")
    @Column(unique = true, nullable = false)
    @Schema(description = "Username of the user", example = "alice_smith", required = true)
    private String username;

    @NotNull(message = "Sharing location status cannot be null")
    @Column(nullable = false)
    @Schema(description = "Whether the user is sharing location", example = "true", required = true)
    private boolean sharingLocation;

    @Schema(description = "Timestamp of last location update", example = "2024-06-10T14:30:00")
    private LocalDateTime lastLocationUpdate;

    @ManyToOne
    @JoinColumn(name = "circle_id")
    @Schema(description = "Circle associated with the user")
    private Circle circle;

    @OneToMany(mappedBy = "user")
    @Schema(description = "Locations associated with the user")
    private List<Location> locations;

    public User() {}

    public User(Long id, String appwriteId, String name, String email, String profilePicture, Integer batteryLevel, boolean sharingLocation, LocalDateTime lastLocationUpdate, Circle circle, List<Location> locations) {
        this.id = id;
        this.appwriteId = appwriteId;
        this.name = name;
        this.email = email;
        this.profilePicture = profilePicture;
        this.batteryLevel = batteryLevel;
        this.sharingLocation = sharingLocation;
        this.lastLocationUpdate = lastLocationUpdate;
        this.circle = circle;
        this.locations = locations;
    }

    public User(Long id, String appwriteId, String email, String name, String profilePicture, Integer batteryLevel) {
        this.id = id;
        this.appwriteId = appwriteId;
        this.email = email;
        this.name = name;
        this.profilePicture = profilePicture;
        this.batteryLevel = batteryLevel;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAppwriteId() { return appwriteId; }
    public void setAppwriteId(String appwriteId) { this.appwriteId = appwriteId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }

    public Integer getBatteryLevel() { return batteryLevel; }
    public void setBatteryLevel(Integer batteryLevel) { this.batteryLevel = batteryLevel; }

    public boolean isSharingLocation() { return sharingLocation; }
    public void setSharingLocation(boolean sharingLocation) { this.sharingLocation = sharingLocation; }

    public LocalDateTime getLastLocationUpdate() { return lastLocationUpdate; }
    public void setLastLocationUpdate(LocalDateTime lastLocationUpdate) { this.lastLocationUpdate = lastLocationUpdate; }

    public Circle getCircle() { return circle; }
    public void setCircle(Circle circle) { this.circle = circle; }

    public List<Location> getLocations() { return locations; }
    public void setLocations(List<Location> locations) { this.locations = locations; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}