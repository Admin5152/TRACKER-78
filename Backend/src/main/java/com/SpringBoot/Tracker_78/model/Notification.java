package com.SpringBoot.Tracker_78.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "notifications")
@Schema(description = "Entity representing a notification sent to a user")
public class Notification {

    public enum NotificationType {
        LOCATION_UPDATE,
        CIRCLE_INVITE,
        EMERGENCY_ALERT,
        SYSTEM_MESSAGE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique identifier of the notification", example = "1")
    private Long id;

    @NotBlank(message = "Message cannot be blank")
    @Column(nullable = false, length = 500)
    @Schema(description = "Notification message", example = "Your location was updated", required = true)
    private String message;

    @NotNull(message = "Notification type cannot be null")
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Schema(description = "Type of notification", example = "LOCATION_UPDATE", required = true)
    private NotificationType type;

    @NotNull(message = "Read status cannot be null")
    @Column(nullable = false)
    @Schema(description = "Read status of the notification", example = "false", required = true)
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(updatable = false, nullable = false)
    @Schema(description = "Timestamp when the notification was created", example = "2024-06-10T14:30:00", required = true)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    @NotNull(message = "Recipient cannot be null")
    @Schema(description = "User who receives the notification", required = true)
    private User recipient;

    @Schema(description = "ID of the related entity", example = "456")
    @Column
    private Long relatedEntityId;

    @Schema(description = "Timestamp when the notification was read", example = "2024-06-10T15:00:00")
    @Column
    private LocalDateTime readAt;

    @Schema(description = "Action URL for notification", example = "/circle/456")
    @Column(length = 50)
    private String actionUrl;

    public Notification() {}

    public Notification(Long id, String message, NotificationType type, Boolean isRead, LocalDateTime createdAt, User recipient, Long relatedEntityId, String actionUrl) {
        this.id = id;
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.recipient = recipient;
        this.relatedEntityId = relatedEntityId;
        this.actionUrl = actionUrl;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public void setRead(boolean read) { this.isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }

    public Long getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(Long relatedEntityId) { this.relatedEntityId = relatedEntityId; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Notification)) return false;
        Notification that = (Notification) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}