package com.SpringBoot.Tracker_78.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Schema(description = "DTO for notification event data")
public class NotificationDataDTO {

    @NotBlank(message = "Event type cannot be blank")
    @Schema(description = "Type of the event", example = "LOCATION_UPDATE", required = true)
    private String eventType;

    @NotBlank(message = "Title cannot be blank")
    @Schema(description = "Notification title", example = "Location Updated", required = true)
    private String title;

    @NotBlank(message = "Message cannot be blank")
    @Schema(description = "Notification message", example = "User has updated their location", required = true)
    private String message;

    @Schema(description = "Location data associated with the event")
    private LocationDTO location;

    @Schema(description = "User data associated with the event")
    private UserDTO user;

    @NotNull(message = "Circle ID cannot be null")
    @Schema(description = "Circle ID related to the event", example = "123", required = true)
    private Long circleId;

    @Schema(description = "Timestamp when notification was created", example = "2024-06-10T14:30:00")
    private LocalDateTime createdAt;

    public NotificationDataDTO() {}

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocationDTO getLocation() { return location; }
    public void setLocation(LocationDTO location) { this.location = location; }

    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }

    public Long getCircleId() { return circleId; }
    public void setCircleId(Long circleId) { this.circleId = circleId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}