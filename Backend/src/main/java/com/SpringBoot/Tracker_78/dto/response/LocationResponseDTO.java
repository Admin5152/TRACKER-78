package com.SpringBoot.Tracker_78.dto.response;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.time.LocalDateTime;

public class LocationResponseDTO {

    @NotBlank(message = "Appwrite ID is required")
    private String appwriteId;

    @NotBlank(message = "Username is required")
    private String username;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String address;

    private String statusMessage;

    @NotNull(message = "Accuracy is required")
    @Min(value = 0, message = "Accuracy must be non-negative")
    private Double accuracy;

    @Min(value = 0, message = "Battery level must be between 0 and 100")
    @Max(value = 100, message = "Battery level must be between 0 and 100")
    private Integer batteryLevel;

    @NotNull(message = "Timestamp is required")
    private LocalDateTime timestamp;

    public LocationResponseDTO() {}

    public LocationResponseDTO(String appwriteId, String username, Double latitude, Double longitude, String address,
                               String statusMessage, Double accuracy, Integer batteryLevel, LocalDateTime timestamp) {
        this.appwriteId = appwriteId;
        this.username = username;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.statusMessage = statusMessage;
        this.accuracy = accuracy;
        this.batteryLevel = batteryLevel;
        this.timestamp = timestamp;
    }

    public String getAppwriteId() { return appwriteId; }
    public void setAppwriteId(String appwriteId) { this.appwriteId = appwriteId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

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
}