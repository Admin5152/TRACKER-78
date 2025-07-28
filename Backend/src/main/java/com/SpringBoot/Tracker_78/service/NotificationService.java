package com.SpringBoot.Tracker_78.service;

import com.SpringBoot.Tracker_78.dto.response.NotificationResponseDTO;
import com.SpringBoot.Tracker_78.model.Notification;
import com.SpringBoot.Tracker_78.model.User;

import java.util.List;

public interface NotificationService {
    List<Notification> getNotificationsForUser(User user);
    List<Notification> getUnreadNotificationsForUser(User user);
    NotificationResponseDTO toResponseDTO(Notification notification);
    void sendLowBatteryNotification(String circleId, String userName, int batteryLevel);
    void deleteNotification(Long id, User user);
    void markAllAsRead(User user);
    void sendManualLocationShareNotification(String circleId, String userName);
    void broadcastNotification(NotificationResponseDTO notificationDTO, Long recipientId);
    Notification createNotification(String message, Notification.NotificationType type, User recipient, Long relatedEntityId, String actionUrl);
    Notification markAsRead(Long notificationId);
}