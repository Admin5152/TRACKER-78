package com.SpringBoot.Tracker_78.service.impl;

import com.SpringBoot.Tracker_78.dto.response.NotificationResponseDTO;
import com.SpringBoot.Tracker_78.model.Notification;
import com.SpringBoot.Tracker_78.model.User;
import com.SpringBoot.Tracker_78.repository.NotificationRepository;
import com.SpringBoot.Tracker_78.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    @Override
    public List<Notification> getUnreadNotificationsForUser(User user) {
        return notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    @Override
    public NotificationResponseDTO toResponseDTO(Notification notification) {
        NotificationResponseDTO dto = new NotificationResponseDTO();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType().name());
        dto.setRelatedEntityId(notification.getRelatedEntityId());
        dto.setActionUrl(notification.getActionUrl());
        dto.setRead(notification.getIsRead());
        dto.setReadAt(notification.getReadAt());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setRecipientId(notification.getRecipient().getId());
        dto.setRecipientUsername(notification.getRecipient().getUsername());
        return dto;
    }

    @Override
    public void sendLowBatteryNotification(String circleId, String userName, int batteryLevel) {
        String message = userName + "'s phone battery is " + batteryLevel + "%";
        messagingTemplate.convertAndSend("/topic/circle/" + circleId + "/notifications", message);
    }

    @Override
    public void sendManualLocationShareNotification(String circleId, String userName) {
        String message = userName + " shared their location manually";
        messagingTemplate.convertAndSend("/topic/circle/" + circleId + "/notifications", message);
    }

    @Override
    public void broadcastNotification(NotificationResponseDTO notificationDTO, Long recipientId) {
        messagingTemplate.convertAndSend("/topic/notifications/" + recipientId, notificationDTO);
    }

    @Override
    public Notification createNotification(String message, Notification.NotificationType type, User recipient, Long relatedEntityId, String actionUrl) {
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setType(type);
        notification.setRecipient(recipient);
        notification.setRelatedEntityId(relatedEntityId);
        notification.setActionUrl(actionUrl);
        notification.setIsRead(false);
        notification.setReadAt(null);
        return notificationRepository.save(notification);
    }

    @Override
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found"));
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    @Override
    public void deleteNotification(Long id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        notificationRepository.delete(notification);
    }

    @Override
    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedAtDesc(user);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        }
        notificationRepository.saveAll(notifications);
    }
}