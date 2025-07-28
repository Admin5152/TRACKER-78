package com.SpringBoot.Tracker_78.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Schema(description = "Data transfer object for location sharing")
public class LocationDTO {

    @NotBlank(message = "Appwrite ID cannot be blank")
    @Schema(description = "User's Appwrite ID", example = "user123", required = true)
    private String appwriteId;

    @NotNull(message = "Latitude cannot be null")
    @Schema(description = "Latitude coordinate", example = "37.7749", required = true)
    private Double latitude;

    @NotNull(message = "Longitude cannot be null")
    @Schema(description = "Longitude coordinate", example = "-122.4194", required = true)
    private Double longitude;

    @Schema(description = "Formatted address", example = "123 Main St, San Francisco")
    private String address;

    @Schema(description = "User's status message", example = "At home")
    private String statusMessage;

    @Schema(description = "Location accuracy in meters", example = "25.5")
    private Double accuracy;

    @Schema(description = "Battery level when location was recorded", example = "85")
    private Integer batteryLevel;

    @Schema(description = "Timestamp when location was recorded", example = "2024-06-10T14:30:00")
    private LocalDateTime recordedAt;

    public LocationDTO() {
    }

    public LocationDTO(String appwriteId, Double latitude, Double longitude, String address, String statusMessage, Double accuracy, Integer batteryLevel, LocalDateTime recordedAt) {
        this.appwriteId = appwriteId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.statusMessage = statusMessage;
        this.accuracy = accuracy;
        this.batteryLevel = batteryLevel;
        this.recordedAt = recordedAt;
    }

    public String getAppwriteId() {
        return appwriteId;
    }

    public void setAppwriteId(String appwriteId) {
        this.appwriteId = appwriteId;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }

    public Integer getBatteryLevel() {
        return batteryLevel;
    }

    public void setBatteryLevel(Integer batteryLevel) {
        this.batteryLevel = batteryLevel;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}