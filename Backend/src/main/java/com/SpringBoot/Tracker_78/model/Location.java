package com.SpringBoot.Tracker_78.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Schema(description = "Entity representing a user's location data")
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique identifier of the location", example = "1")
    private Long id;

    @NotBlank(message = "Appwrite ID cannot be blank")
    @Schema(description = "Appwrite ID of the user", example = "user123", required = true)
    private String appwriteId;

    @NotNull(message = "Latitude cannot be null")
    @Schema(description = "Latitude coordinate", example = "37.7749", required = true)
    private Double latitude;

    @NotNull(message = "Longitude cannot be null")
    @Schema(description = "Longitude coordinate", example = "-122.4194", required = true)
    private Double longitude;

    @Schema(description = "Address of the location", example = "123 Main St, San Francisco, CA")
    private String address;

    @Schema(description = "Status message for the location", example = "At home")
    private String statusMessage;

    @Schema(description = "Accuracy of the location in meters", example = "5.0")
    private Double accuracy;

    @Schema(description = "Battery level of the user's device", example = "85")
    private Integer batteryLevel;

    @NotNull(message = "Timestamp cannot be null")
    @Schema(description = "Timestamp when the location was recorded", example = "2024-06-10T14:30:00", required = true)
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @Schema(description = "User associated with the location")
    private User user;

    @ManyToOne
    @JoinColumn(name = "circle_id")
    @Schema(description = "Circle associated with the location")
    private Circle circle;

    public Location() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAppwriteId() { return appwriteId; }
    public void setAppwriteId(String appwriteId) { this.appwriteId = appwriteId; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

    public Double getAccuracy() { return accuracy; }
    public void setAccuracy(Double accuracy) { this.accuracy = accuracy; }

    public Integer getBatteryLevel() { return batteryLevel; }
    public void setBatteryLevel(Integer batteryLevel) { this.batteryLevel = batteryLevel; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Circle getCircle() { return circle; }
    public void setCircle(Circle circle) { this.circle = circle; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Location)) return false;
        Location location = (Location) o;
        return Objects.equals(id, location.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}