package com.SpringBoot.Tracker_78.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Schema(description = "DTO for notification data")
public class NotificationDTO {

    @Schema(description = "Notification ID", example = "101")
    private Long id;

    @NotBlank(message = "Message cannot be blank")
    @Schema(description = "Notification message", example = "Your location was updated", required = true)
    private String message;

    @NotBlank(message = "Type cannot be blank")
    @Schema(description = "Type of notification", example = "LOCATION_UPDATE", required = true)
    private String type;

    @Schema(description = "Related entity ID", example = "456")
    private Long relatedEntityId;

    @Schema(description = "Action URL for notification", example = "/circle/456")
    private String actionUrl;

    @Schema(description = "Read status", example = "false")
    private boolean isRead;

    @Schema(description = "Timestamp when notification was read", example = "2024-06-10T15:00:00")
    private LocalDateTime readAt;

    @Schema(description = "Timestamp when notification was created", example = "2024-06-10T14:30:00")
    private LocalDateTime createdAt;

    @NotNull(message = "Recipient ID cannot be null")
    @Schema(description = "Recipient user ID", example = "123", required = true)
    private Long recipientId;

    @NotBlank(message = "Recipient username cannot be blank")
    @Schema(description = "Recipient username", example = "alice.smith", required = true)
    private String recipientUsername;

    public NotificationDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(Long relatedEntityId) { this.relatedEntityId = relatedEntityId; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

    public String getRecipientUsername() { return recipientUsername; }
    public void setRecipientUsername(String recipientUsername) { this.recipientUsername = recipientUsername; }
}