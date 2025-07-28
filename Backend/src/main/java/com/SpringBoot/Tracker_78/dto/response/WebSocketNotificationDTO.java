package com.SpringBoot.Tracker_78.dto.response;

import com.SpringBoot.Tracker_78.dto.NotificationDataDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class WebSocketNotificationDTO {

    @NotBlank(message = "Notification type is required")
    private String type;

    @NotNull(message = "Notification data is required")
    private NotificationDataDTO data;

    public WebSocketNotificationDTO() {}

    public WebSocketNotificationDTO(String type, NotificationDataDTO data) {
        this.type = type;
        this.data = data;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public NotificationDataDTO getData() { return data; }
    public void setData(NotificationDataDTO data) { this.data = data; }
}