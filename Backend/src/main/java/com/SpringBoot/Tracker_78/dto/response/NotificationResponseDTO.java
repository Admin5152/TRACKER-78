package com.SpringBoot.Tracker_78.dto.response;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class NotificationResponseDTO {

    @NotNull(message = "Notification ID is required")
    private Long id;

    @NotBlank(message = "Message is required")
    private String message;

    @NotBlank(message = "Type is required")
    private String type;

    @NotNull(message = "Related entity ID is required")
    private Long relatedEntityId;

    private String actionUrl;

    @NotNull(message = "Read status is required")
    private boolean isRead;

    private LocalDateTime readAt;

    @NotNull(message = "CreatedAt is required")
    private LocalDateTime createdAt;

    @NotNull(message = "Recipient ID is required")
    private Long recipientId;

    @NotBlank(message = "Recipient username is required")
    private String recipientUsername;

    public NotificationResponseDTO() {}

    public NotificationResponseDTO(Long id, String message, String type, Long relatedEntityId, String actionUrl,
                                   boolean isRead, LocalDateTime readAt, LocalDateTime createdAt,
                                   Long recipientId, String recipientUsername) {
        this.id = id;
        this.message = message;
        this.type = type;
        this.relatedEntityId = relatedEntityId;
        this.actionUrl = actionUrl;
        this.isRead = isRead;
        this.readAt = readAt;
        this.createdAt = createdAt;
        this.recipientId = recipientId;
        this.recipientUsername = recipientUsername;
    }

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

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

    public String getRecipientUsername() { return recipientUsername; }
    public void setRecipientUsername(String recipientUsername) { this.recipientUsername = recipientUsername; }
}