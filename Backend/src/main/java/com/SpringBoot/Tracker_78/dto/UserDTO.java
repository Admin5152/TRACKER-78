package com.SpringBoot.Tracker_78.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Schema(description = "DTO representing a user profile")
public class UserDTO {

    @NotNull(message = "User ID cannot be null")
    @Schema(description = "Unique identifier of the user", example = "123", required = true)
    private Long id;

    @NotBlank(message = "Appwrite ID cannot be blank")
    @Schema(description = "User's Appwrite ID", example = "user123", required = true)
    private String appwriteId;

    @NotBlank(message = "Name cannot be blank")
    @Schema(description = "User's name", example = "Alice Smith", required = true)
    private String name;

    @NotBlank(message = "Email cannot be blank")
    @Schema(description = "User's email address", example = "alice@example.com", required = true)
    private String email;

    @Schema(description = "URL to user's profile picture", example = "https://example.com/profile.jpg")
    private String profilePicture;

    @Schema(description = "User's battery level", example = "85")
    private Integer batteryLevel;

    @Schema(description = "Whether the user is sharing location", example = "true")
    private boolean sharingLocation;

    @Schema(description = "Timestamp of last location update", example = "2024-06-10T14:30:00")
    private LocalDateTime lastLocationUpdate;

    public UserDTO() {}

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
}